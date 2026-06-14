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

        const contentType = request.headers.get('content-type') || '';

        // --- STAGE 2: Process JSON array of contacts to save into DB ---
        if (contentType.includes('application/json')) {
            const body = await request.json();
            const contacts = body.contacts;

            if (!Array.isArray(contacts)) {
                return NextResponse.json({ error: 'Invalid payload: contacts must be an array' }, { status: 400 });
            }

            await dbConnect();

            const imported = [];
            const skipped = [];
            const errors = [];

            for (const row of contacts) {
                const email = row.email || '';
                const company = row.company || '';
                const jobRole = row.jobRole || '';

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

                // Parse tags
                let tags = [];
                if (Array.isArray(row.tags)) {
                    tags = row.tags;
                } else if (typeof row.tags === 'string') {
                    tags = row.tags
                        .split(/[\s,]+/)
                        .map(t => t.replace(/^#/, '').trim())
                        .filter(Boolean);
                }

                // Create new HR email
                try {
                    await HrEmail.create({
                        userId: session.user.id,
                        email: email.toLowerCase(),
                        hrName: row.hrName || '',
                        company,
                        jobRole,
                        tags,
                        notes: row.notes || '',
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
        }

        // --- STAGE 1: Parse uploaded CSV/Excel file and return JSON list ---
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 🔒 SECURITY: Limit file size to 5MB to prevent DoS via large uploads
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
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

        // 🔒 SECURITY: Cap row count to prevent CPU exhaustion
        const MAX_ROWS = 1000;
        if (parsedData.length > MAX_ROWS) {
            return NextResponse.json({
                error: `File contains too many rows (${parsedData.length}). Maximum allowed is ${MAX_ROWS} contacts per import.`
            }, { status: 400 });
        }

        const contacts = [];
        for (const row of parsedData) {
            const email = row.email || row.Email || '';
            const company = row.company || row.Company || '';
            const jobRole = row.jobRole || row['Job Role'] || row.jobrole || '';
            const hrName = row.hrName || row['HR Name'] || row.hrname || '';
            const rawTags = row.tags || row.Tags || '';
            const notes = row.notes || row.Notes || '';

            // Map tags to array of strings
            const tags = typeof rawTags === 'string'
                ? rawTags
                    .split(/[\s,]+/)
                    .map(t => t.replace(/^#/, '').trim())
                    .filter(Boolean)
                : (Array.isArray(rawTags) ? rawTags : []);

            contacts.push({
                email,
                company,
                jobRole,
                hrName,
                tags,
                notes,
            });
        }

        return NextResponse.json({
            success: true,
            contacts,
        });
    } catch (error) {
        console.error('Error importing file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
