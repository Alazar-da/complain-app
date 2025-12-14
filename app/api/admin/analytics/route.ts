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
    const city = searchParams.get("city");
    const subCity = searchParams.get("subCity");
    const educationCommunity = searchParams.get("educationCommunity");

    // 🧠 Build dynamic filter
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
    if (city && city !== "All") filter.city = city;
    if (subCity && subCity !== "All") filter.subCity = subCity;
    if (educationCommunity && educationCommunity !== "All") filter.educationCommunity = educationCommunity;

    // 🔹 Fetch ALL complaints that match filters
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    // 🔹 Aggregations
    const total = complaints.length;

    const statusCounts = complaints.reduce((acc: Record<string, number>, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const levelCounts = complaints.reduce((acc: Record<string, number>, c) => {
      acc[c.level] = (acc[c.level] || 0) + 1;
      return acc;
    }, {});

    const departmentCounts = complaints.reduce((acc: Record<string, number>, c) => {
      acc[c.department] = (acc[c.department] || 0) + 1;
      return acc;
    }, {});

    const cityCounts = complaints.reduce((acc: Record<string, number>, c) => {
      if (c.city) {
        acc[c.city] = (acc[c.city] || 0) + 1;
      }
      return acc;
    }, {});

    const educationCommunityCounts = complaints.reduce((acc: Record<string, number>, c) => {
      acc[c.educationCommunity] = (acc[c.educationCommunity] || 0) + 1;
      return acc;
    }, {});

    // 🔹 Daily count aggregation (for charts)
    const dailyCountsMap: Record<string, number> = {};
    complaints.forEach((c) => {
      const date = new Date(c.date).toISOString().split("T")[0];
      dailyCountsMap[date] = (dailyCountsMap[date] || 0) + 1;
    });

    const dailyCounts = Object.entries(dailyCountsMap).map(([date, count]) => ({
      date,
      count,
    }));

    // ✅ Match frontend shape
    return NextResponse.json({
      total,
      complaints,
      statusCounts,
      levelCounts,
      departmentCounts,
      cityCounts,
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