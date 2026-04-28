import { NextResponse } from "next/server";
import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const level = searchParams.get("level");
    const department = searchParams.get("department");
    const subDepartment = searchParams.get("subDepartment");
    const subCity = searchParams.get("subCity");
    const wereda = searchParams.get("wereda");
    const educationCommunity = searchParams.get("educationCommunity");

    // 🔹 Dynamic filter
    const filter: any = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status && status !== "All") filter.status = status;
    if (level && level !== "All") filter.level = level;
    if (department && department !== "All") filter.department = department;
    if (subDepartment && subDepartment !== "All") filter.subDepartment = subDepartment;
    if (subCity && subCity !== "All") filter.subCity = subCity;
    if (wereda && wereda !== "All") filter.wereda = wereda;
    if (educationCommunity && educationCommunity !== "All") {
      filter.educationCommunity = educationCommunity;
    }

    // 🔹 Fetch complaints
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    // 🔹 Total
    const total = complaints.length;

    // 🔹 Aggregations
    const countByField = (field: string) =>
      complaints.reduce((acc: Record<string, number>, c: any) => {
        if (c[field]) {
          acc[c[field]] = (acc[c[field]] || 0) + 1;
        }
        return acc;
      }, {});

    const statusCounts = countByField("status");
    const levelCounts = countByField("level");
    const departmentCounts = countByField("department");
    const cityCounts = countByField("city");
    const subCityCounts = countByField("subCity");       // ✅ NEW
    const weredaCounts = countByField("wereda");         // ✅ NEW
    const educationCommunityCounts = countByField("educationCommunity");

    // 🔹 Daily counts (for charts)
    const dailyCountsMap: Record<string, number> = {};

    complaints.forEach((c) => {
      const date = new Date(c.date).toISOString().split("T")[0];
      dailyCountsMap[date] = (dailyCountsMap[date] || 0) + 1;
    });

    const dailyCounts = Object.entries(dailyCountsMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 🔹 Response
    return NextResponse.json({
      total,
      complaints,
      statusCounts,
      levelCounts,
      departmentCounts,
      cityCounts,
      subCityCounts,          // ✅ INCLUDED
      weredaCounts,           // ✅ INCLUDED
      educationCommunityCounts,
      dailyCounts,
    });

  } catch (error) {
    console.error("❌ Error in analytics API:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}