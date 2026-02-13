import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import HrEmail from '@/models/HrEmail';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        let parsedData = [];

        // Check if Excel file (.xlsx or .xls)
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Parse Excel file
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            parsedData = XLSX.utils.sheet_to_json(worksheet);

            if (parsedData.length === 0) {
                return NextResponse.json({ error: 'Excel file is empty or invalid' }, { status: 400 });
            }
        } else if (fileName.endsWith('.csv')) {
            // Parse CSV file
            const text = await file.text();
            const result = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
            });

            if (result.errors.length > 0) {
                return NextResponse.json({ error: 'Invalid CSV file' }, { status: 400 });
            }

            parsedData = result.data;
        } else {
            return NextResponse.json({ error: 'Invalid file type. Please upload CSV or Excel file.' }, { status: 400 });
        }

        await dbConnect();

        const imported = [];
        const skipped = [];
        const errors = [];

        for (const row of parsedData) {
            const email = row.email || row.Email;
            const company = row.company || row.Company;
            const jobRole = row.jobRole || row['Job Role'] || row.jobrole;

            if (!email) {
                errors.push({ row, reason: 'Missing email' });
                continue;
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push({ row, reason: 'Invalid email format' });
                continue;
            }

            if (!company) {
                errors.push({ row, reason: 'Missing company' });
                continue;
            }

            if (!jobRole) {
                errors.push({ row, reason: 'Missing jobRole' });
                continue;
            }

            // Check for duplicate
            const existing = await HrEmail.findOne({
                userId: session.user.id,
                email: email.toLowerCase(),
            });

            if (existing) {
                skipped.push(email);
                continue;
            }

            // Parse tags — support "#react #frontend" or "react, frontend" format
            const rawTags = row.tags || row.Tags || '';
            const tags = rawTags
                .split(/[\s,]+/)
                .map(t => t.replace(/^#/, '').trim())
                .filter(Boolean);

            // Create new HR email
            try {
                await HrEmail.create({
                    userId: session.user.id,
                    email: email.toLowerCase(),
                    hrName: row.hrName || row['HR Name'] || '',
                    company,
                    jobRole,
                    tags,
                    notes: row.notes || row.Notes || '',
                });
                imported.push(email);
            } catch (error) {
                errors.push({ row, reason: error.message });
            }
        }

        // Create notification if HR emails were imported
        if (imported.length > 0) {
            try {
                const user = await User.findById(session.user.id);
                if (user) {
                    await Notification.create({
                        userId: user._id,
                        userEmail: user.email,
                        title: 'HR List Synced',
                        message: `Successfully imported ${imported.length} new HR contact${imported.length !== 1 ? 's' : ''}`,
                        type: 'hr_sync',
                        icon: 'Users',
                        link: '/hr-emails',
                        isRead: false,
                    });
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
                // Don't fail the request if notification creation fails
            }
        }

        return NextResponse.json({
            imported: imported.length,
            skipped: skipped.length,
            errors: errors.length,
            details: {
                imported,
                skipped,
                errors,
            },
        });
    } catch (error) {
        console.error('Error importing file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
