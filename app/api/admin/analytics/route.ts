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

    const match: any = {};

    // ✅ Only add filters when they're actually provided
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        match.date.$lte = endOfDay;
      }
    }

    if (status && status !== "all") match.status = status;
    if (level && level !== "all") match.level = level;
    if (department && department !== "all") match.department = department;
    if (subDepartment && subDepartment !== "all") match.subDepartment = subDepartment;

    // ✅ If no filters applied, show all complaints
    const isFiltered = Object.keys(match).length > 0;

    const [
      statusAgg,
      levelAgg,
      departmentAgg,
      dailyAgg,
      items,
      allDepartments,
      allSubs,
      totalCount,
    ] = await Promise.all([
      Complaint.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $match: match }, { $group: { _id: "$level", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $match: match }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Complaint.find(match)
        .sort({ date: -1 })
        .select("title department subDepartment level status date")
        .lean(),
      Complaint.distinct("department"),
      Complaint.distinct("subDepartment"),
      Complaint.countDocuments(match),
    ]);

    const statusCounts = Object.fromEntries(statusAgg.map(r => [r._id || "Unknown", r.count || 0]));
    const levelCounts = Object.fromEntries(levelAgg.map(r => [r._id || "Unknown", r.count || 0]));
    const departmentCounts = Object.fromEntries(departmentAgg.map(r => [r._id || "Unknown", r.count || 0]));
    const dailyCounts = dailyAgg.map(r => ({ date: r._id, count: r.count }));

    const summary = {
      totalComplaints: totalCount,
      totalDepartments: allDepartments.filter(Boolean).length,
      totalSubDepartments: allSubs.filter(Boolean).length,
      dateRange: {
        start: startDate || "N/A",
        end: endDate || "N/A",
      },
      isFiltered,
    };

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        levelCounts,
        departmentCounts,
        dailyCounts,
        items,
        departments: allDepartments.filter(Boolean),
        subDepartments: allSubs.filter(Boolean),
        summary,
      },
    });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
