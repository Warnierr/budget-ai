import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClientNeon } from "../dashboard/dashboard-client-neon";

export default async function NewDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Mock data for demo
    const mockData = {
        balance: 2450,
        totalIncome: 4200,
        totalExpenseReal: 1750,
        projectedBalance: 2600,
        pieData: [
            { name: 'Utilities', value: 450, color: '#60a5fa' },
            { name: 'Food', value: 620, color: '#f97316' },
            { name: 'Entertainment', value: 280, color: '#a78bfa' },
            { name: 'Transport', value: 400, color: '#10b981' },
        ],
        recentActivity: [
            { id: '1', name: 'Salaire', amount: 3500, type: 'income', date: '2024-12-01' },
            { id: '2', name: 'Netflix', amount: 15.99, type: 'expense', date: '2024-12-02' },
            { id: '3', name: 'Courses', amount: 85.50, type: 'expense', date: '2024-12-03' },
            { id: '4', name: 'Freelance', amount: 700, type: 'income', date: '2024-12-04' },
            { id: '5', name: 'Restaurant', amount: 45, type: 'expense', date: '2024-12-05' },
        ],
        allTransactions: [],
    };

    return <DashboardClientNeon data={mockData} />;
}
