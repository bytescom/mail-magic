import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CoverLetterTemplate from '@/models/CoverLetterTemplate';

// ═══════════════════════════════════════════════════════
// SYSTEM TEMPLATES (seeded on first GET if none exist)
// ═══════════════════════════════════════════════════════
const SYSTEM_TEMPLATES = [
    {
        title: 'Software Engineer — General',
        category: 'tech',
        targetRole: 'Software Engineer',
        description: 'A versatile cover letter for SWE roles emphasizing technical skills and impact.',
        variables: ['name', 'company', 'role', 'experience_years', 'top_skill', 'notable_project'],
        content: `Dear Hiring Manager,

I am writing to express my strong interest in the {role} position at {company}. With {experience_years} years of experience in software development, I bring a proven track record of building scalable, production-ready systems.

In my most recent role, I {notable_project}, demonstrating my ability to deliver impactful solutions. My core expertise lies in {top_skill}, and I am passionate about writing clean, maintainable code that solves real problems.

What excites me about {company} is the opportunity to contribute to meaningful technical challenges alongside a talented team. I thrive in environments that value engineering excellence and continuous improvement.

I am confident that my technical depth, collaborative mindset, and drive for quality would make me a strong addition to your team. I would welcome the opportunity to discuss how I can contribute to {company}'s mission.

Best regards,
{name}`,
    },
    {
        title: 'Frontend Developer — React Specialist',
        category: 'tech',
        targetRole: 'Frontend Developer',
        description: 'Tailored for frontend roles with emphasis on UI/UX craft and modern frameworks.',
        variables: ['name', 'company', 'role', 'experience_years', 'framework', 'portfolio_highlight'],
        content: `Dear Hiring Team,

I am excited to apply for the {role} position at {company}. As a frontend developer with {experience_years} years of experience specializing in {framework}, I am passionate about creating exceptional user experiences.

{portfolio_highlight}

I believe great frontend work is where engineering meets design — crafting interfaces that are not only visually stunning but also performant, accessible, and maintainable. I have deep experience with responsive design, component architecture, and modern tooling.

{company}'s commitment to user experience aligns perfectly with my professional values. I would love to bring my skills in building pixel-perfect, high-performance interfaces to your team.

Looking forward to the opportunity to discuss my fit for this role.

Warm regards,
{name}`,
    },
    {
        title: 'Data Scientist — Analytics Focus',
        category: 'tech',
        targetRole: 'Data Scientist',
        description: 'For data science roles combining statistical rigor with business impact.',
        variables: ['name', 'company', 'role', 'experience_years', 'key_achievement', 'specialization'],
        content: `Dear Data Science Team,

I am writing to apply for the {role} position at {company}. With {experience_years} years of experience in data science and {specialization}, I am eager to bring my analytical expertise to your organization.

{key_achievement}

My approach combines rigorous statistical methodology with practical business acumen. I have extensive experience in the full data science lifecycle — from hypothesis formulation and data collection to model deployment and stakeholder communication.

I am drawn to {company} because of the scale and complexity of the problems you are solving. I am confident my ability to translate complex data into actionable insights would drive meaningful impact.

I welcome the opportunity to discuss how my skills align with your team's goals.

Best regards,
{name}`,
    },
    {
        title: 'Product Manager — Strategic',
        category: 'management',
        targetRole: 'Product Manager',
        description: 'For PM roles emphasizing strategy, user empathy, and cross-functional leadership.',
        variables: ['name', 'company', 'role', 'experience_years', 'product_achievement', 'domain'],
        content: `Dear Hiring Manager,

I am excited to apply for the {role} position at {company}. With {experience_years} years of product management experience in {domain}, I have a proven ability to define product vision, drive strategy, and ship products that delight users.

{product_achievement}

My approach to product management centers on three pillars: deep user empathy, data-driven decision-making, and relentless prioritization. I have led cross-functional teams through ambiguous challenges, consistently delivering outcomes that exceed business objectives.

What draws me to {company} is the opportunity to shape products that impact users at scale. I am passionate about building products that matter, and I believe my strategic mindset and execution skills would be a strong fit for your team.

I look forward to discussing how I can contribute to {company}'s product vision.

Best regards,
{name}`,
    },
    {
        title: 'UX Designer — Portfolio-Driven',
        category: 'design',
        targetRole: 'UX Designer',
        description: 'For UX roles showcasing design process, research skills, and user advocacy.',
        variables: ['name', 'company', 'role', 'experience_years', 'design_highlight', 'design_tool'],
        content: `Dear Design Team,

I am thrilled to apply for the {role} position at {company}. As a UX designer with {experience_years} years of experience, I am passionate about creating human-centered designs that balance user needs with business goals.

{design_highlight}

My design process is rooted in research — I believe every great interface starts with understanding the people who will use it. I am proficient in {design_tool} and have experience with design systems, accessibility standards, and rapid prototyping.

{company}'s design philosophy resonates deeply with my own approach. I would love to contribute my skills in user research, interaction design, and visual storytelling to your team.

Looking forward to sharing my portfolio and discussing how I can contribute.

Warm regards,
{name}`,
    },
    {
        title: 'DevOps Engineer — Infrastructure',
        category: 'tech',
        targetRole: 'DevOps Engineer',
        description: 'For DevOps/SRE roles focusing on automation, reliability, and cloud expertise.',
        variables: ['name', 'company', 'role', 'experience_years', 'infrastructure_achievement', 'cloud_platform'],
        content: `Dear Engineering Team,

I am writing to express my interest in the {role} position at {company}. With {experience_years} years of DevOps experience specializing in {cloud_platform}, I bring deep expertise in building reliable, scalable infrastructure.

{infrastructure_achievement}

I am passionate about automation, observability, and creating systems that empower development teams to ship with confidence. My experience spans CI/CD pipeline design, container orchestration, infrastructure as code, and incident management.

I am impressed by {company}'s engineering culture and would welcome the opportunity to contribute to your infrastructure goals. I am confident my skills in automation and reliability engineering would drive meaningful improvements.

Best regards,
{name}`,
    },
    {
        title: 'Business Analyst — Impact Focused',
        category: 'consulting',
        targetRole: 'Business Analyst',
        description: 'For BA and consulting roles highlighting analytical skills and business impact.',
        variables: ['name', 'company', 'role', 'experience_years', 'analysis_achievement', 'industry'],
        content: `Dear Hiring Manager,

I am interested in the {role} position at {company}. With {experience_years} years of experience in business analysis within the {industry} sector, I have a strong track record of translating complex business challenges into actionable strategies.

{analysis_achievement}

My analytical toolkit includes data analysis, process optimization, stakeholder management, and requirements gathering. I pride myself on bridging the gap between technical teams and business stakeholders, ensuring solutions align with strategic objectives.

{company}'s reputation for excellence in {industry} makes this opportunity particularly exciting. I am eager to contribute my analytical expertise and strategic thinking to your team.

I look forward to discussing how my experience can add value to your organization.

Best regards,
{name}`,
    },
    {
        title: 'Startup — Generalist / Early Stage',
        category: 'startup',
        targetRole: 'Full Stack Developer',
        description: 'Ideal for startup roles where versatility, speed, and ownership matter most.',
        variables: ['name', 'company', 'role', 'key_strength', 'startup_experience', 'motivation'],
        content: `Hi there,

I am excited about the {role} opportunity at {company}. As someone who thrives in fast-paced, high-ownership environments, I believe I'd be a strong fit for your team.

{startup_experience}

My key strength is {key_strength} — but more importantly, I am the kind of person who does whatever it takes to ship great products. I am comfortable wearing multiple hats, moving fast, and making pragmatic decisions.

{motivation}

I would love to chat about how I can contribute to {company}'s growth. Looking forward to connecting.

Best,
{name}`,
    },
    {
        title: 'Marketing — Digital & Growth',
        category: 'marketing',
        targetRole: 'Marketing Manager',
        description: 'For digital marketing and growth roles with data-driven achievements.',
        variables: ['name', 'company', 'role', 'experience_years', 'growth_metric', 'channel_expertise'],
        content: `Dear Marketing Team,

I am writing to apply for the {role} position at {company}. With {experience_years} years of experience in digital marketing and {channel_expertise}, I am passionate about driving measurable growth.

{growth_metric}

My approach to marketing is data-driven and user-centric. I have experience across the full marketing funnel — from brand awareness and content strategy to conversion optimization and retention. I believe in testing hypotheses rigorously and scaling what works.

{company}'s brand and market position present an exciting opportunity for growth, and I am confident my skills in {channel_expertise} would help accelerate your marketing goals.

I look forward to discussing how I can contribute.

Best regards,
{name}`,
    },
    {
        title: 'Finance — Investment & Analysis',
        category: 'finance',
        targetRole: 'Financial Analyst',
        description: 'For finance roles emphasizing analytical precision and financial modeling.',
        variables: ['name', 'company', 'role', 'experience_years', 'finance_achievement', 'specialization'],
        content: `Dear Hiring Manager,

I am applying for the {role} position at {company}. With {experience_years} years of experience in {specialization}, I bring a strong foundation in financial analysis, modeling, and strategic decision support.

{finance_achievement}

My expertise includes financial modeling, valuation analysis, budgeting, and forecasting. I am proficient in Excel, SQL, and financial software, and I have a track record of producing analyses that directly inform executive decision-making.

I am drawn to {company} because of its reputation in the financial sector and the caliber of work produced by your team. I am confident my analytical rigor and attention to detail would be valuable assets.

I welcome the opportunity to discuss my qualifications further.

Best regards,
{name}`,
    },
];

// Seed system templates if none exist
async function seedSystemTemplates() {
    const existingCount = await CoverLetterTemplate.countDocuments({ isSystem: true });
    if (existingCount === 0) {
        const templates = SYSTEM_TEMPLATES.map(t => ({ ...t, isSystem: true, userId: null }));
        await CoverLetterTemplate.insertMany(templates);
        return templates.length;
    }
    return 0;
}

// ═══════════════════════════════════════════════════════
// GET - List templates
// ═══════════════════════════════════════════════════════
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        await seedSystemTemplates();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        // Get system templates + user's own templates
        const query = {
            $or: [
                { isSystem: true },
                { userId: session.user.id },
            ],
        };

        if (category && category !== 'all') {
            query.category = category;
        }

        const templates = await CoverLetterTemplate.find(query)
            .sort({ isSystem: -1, usageCount: -1, createdAt: -1 })
            .lean();

        // Category counts
        const categories = await CoverLetterTemplate.aggregate([
            { $match: { $or: [{ isSystem: true }, { userId: new (await import('mongoose')).default.Types.ObjectId(session.user.id) }] } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        return NextResponse.json({
            templates,
            categories,
            total: templates.length,
        });

    } catch (error) {
        console.error('Error fetching cover letter templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════
// POST - Create new template
// ═══════════════════════════════════════════════════════
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const { title, category, targetRole, description, content, variables } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Extract variables from content if not provided
        const extractedVars = variables || [...new Set((content.match(/\{(\w+)\}/g) || []).map(v => v.slice(1, -1)))];

        const template = await CoverLetterTemplate.create({
            userId: session.user.id,
            title,
            category: category || 'general',
            targetRole: targetRole || '',
            description: description || '',
            content,
            variables: extractedVars,
            isSystem: false,
        });

        return NextResponse.json({ template }, { status: 201 });

    } catch (error) {
        console.error('Error creating cover letter template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════
// PATCH - Update template (user's own only)
// ═══════════════════════════════════════════════════════
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { templateId, incrementUsage, ...updates } = body;

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        if (incrementUsage) {
            await CoverLetterTemplate.findByIdAndUpdate(templateId, {
                $inc: { usageCount: 1 },
            });
            return NextResponse.json({ success: true });
        }

        // Only allow editing user's own templates
        const template = await CoverLetterTemplate.findOneAndUpdate(
            { _id: templateId, userId: session.user.id, isSystem: false },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!template) {
            return NextResponse.json({ error: 'Template not found or not editable' }, { status: 404 });
        }

        return NextResponse.json({ template });

    } catch (error) {
        console.error('Error updating cover letter template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════
// DELETE - Delete template (user's own only)
// ═══════════════════════════════════════════════════════
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get('id');

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        const result = await CoverLetterTemplate.findOneAndDelete({
            _id: templateId,
            userId: session.user.id,
            isSystem: false,
        });

        if (!result) {
            return NextResponse.json({ error: 'Template not found or cannot be deleted' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting cover letter template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
