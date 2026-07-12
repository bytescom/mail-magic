import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
    const session = await auth()

    if (!session){
        redirect("/login")
    }

    return (
        <div className="w-full min-h-screen flex gap-2 p-2 bg-primary/5">
            <Sidebar />

            <main className="flex-1 min-w-0 min-h-[calc(100vh-16px)] bg-background/90 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl p-5 flex flex-col gap-5 overflow-hidden">
                {children}
            </main>
        </div>
    )
}