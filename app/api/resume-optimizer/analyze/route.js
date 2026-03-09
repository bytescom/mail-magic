import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// ROLE-SPECIFIC KEYWORD DATABASE
// ═══════════════════════════════════════════════════════
const ROLE_KEYWORDS = {
    'Software Engineer': {
        critical: ['software', 'development', 'programming', 'algorithms', 'data structures', 'api', 'testing', 'debugging', 'code review', 'version control'],
        technical: ['javascript', 'python', 'java', 'c++', 'react', 'node.js', 'sql', 'nosql', 'git', 'docker', 'aws', 'rest', 'graphql', 'typescript', 'ci/cd', 'agile', 'scrum', 'microservices', 'kubernetes', 'linux', 'mongodb', 'postgresql', 'redis', 'terraform'],
        soft: ['collaboration', 'communication', 'problem-solving', 'teamwork', 'leadership', 'mentoring', 'analytical'],
    },
    'Frontend Developer': {
        critical: ['frontend', 'ui', 'ux', 'responsive', 'web', 'html', 'css', 'javascript', 'react', 'user interface'],
        technical: ['typescript', 'next.js', 'vue', 'angular', 'tailwind', 'sass', 'webpack', 'vite', 'accessibility', 'wcag', 'seo', 'performance', 'redux', 'graphql', 'rest', 'figma', 'storybook', 'jest', 'cypress', 'playwright'],
        soft: ['design thinking', 'attention to detail', 'user empathy', 'collaboration', 'communication', 'creativity'],
    },
    'Backend Developer': {
        critical: ['backend', 'server', 'api', 'database', 'rest', 'microservices', 'scalability', 'security'],
        technical: ['node.js', 'python', 'java', 'go', 'rust', 'sql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'graphql', 'grpc', 'message queue', 'rabbitmq', 'kafka', 'elasticsearch', 'ci/cd', 'linux'],
        soft: ['problem-solving', 'analytical', 'communication', 'system thinking', 'teamwork'],
    },
    'Full Stack Developer': {
        critical: ['full stack', 'frontend', 'backend', 'api', 'database', 'web application', 'responsive'],
        technical: ['javascript', 'typescript', 'react', 'node.js', 'python', 'sql', 'mongodb', 'docker', 'aws', 'git', 'ci/cd', 'rest', 'graphql', 'next.js', 'express', 'postgresql', 'redis', 'html', 'css', 'tailwind'],
        soft: ['versatility', 'communication', 'problem-solving', 'collaboration', 'ownership', 'self-starter'],
    },
    'Data Scientist': {
        critical: ['data science', 'machine learning', 'statistical', 'analysis', 'modeling', 'python', 'data visualization'],
        technical: ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'r', 'jupyter', 'matplotlib', 'tableau', 'spark', 'deep learning', 'nlp', 'computer vision', 'aws', 'gcp', 'a/b testing', 'hadoop', 'feature engineering'],
        soft: ['analytical', 'communication', 'storytelling', 'curiosity', 'business acumen', 'critical thinking'],
    },
    'Data Analyst': {
        critical: ['data analysis', 'sql', 'reporting', 'visualization', 'excel', 'dashboard', 'insights'],
        technical: ['tableau', 'power bi', 'python', 'r', 'google analytics', 'looker', 'bigquery', 'etl', 'data warehousing', 'statistics', 'a/b testing', 'predictive analytics', 'data modeling'],
        soft: ['attention to detail', 'communication', 'storytelling', 'business acumen', 'problem-solving', 'analytical'],
    },
    'Product Manager': {
        critical: ['product management', 'roadmap', 'strategy', 'stakeholder', 'user research', 'requirements', 'prioritization'],
        technical: ['agile', 'scrum', 'jira', 'analytics', 'a/b testing', 'sql', 'figma', 'product analytics', 'okr', 'kpi', 'market research', 'competitive analysis', 'wireframing', 'user stories'],
        soft: ['leadership', 'communication', 'strategic thinking', 'empathy', 'decision-making', 'negotiation', 'cross-functional'],
    },
    'UX Designer': {
        critical: ['user experience', 'ux', 'ui', 'design', 'user research', 'wireframing', 'prototyping', 'usability'],
        technical: ['figma', 'sketch', 'adobe xd', 'invision', 'framer', 'design systems', 'accessibility', 'responsive design', 'information architecture', 'interaction design', 'user testing', 'a/b testing', 'html', 'css'],
        soft: ['empathy', 'creativity', 'communication', 'collaboration', 'attention to detail', 'user advocacy'],
    },
    'DevOps Engineer': {
        critical: ['devops', 'ci/cd', 'infrastructure', 'automation', 'deployment', 'monitoring', 'cloud'],
        technical: ['docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'aws', 'gcp', 'azure', 'linux', 'bash', 'python', 'prometheus', 'grafana', 'elk', 'nginx', 'helm', 'argocd', 'infrastructure as code'],
        soft: ['problem-solving', 'communication', 'collaboration', 'reliability', 'proactive', 'analytical'],
    },
    'Mobile Developer': {
        critical: ['mobile', 'ios', 'android', 'app development', 'user interface', 'responsive'],
        technical: ['swift', 'kotlin', 'react native', 'flutter', 'dart', 'xcode', 'android studio', 'firebase', 'rest api', 'push notifications', 'app store', 'google play', 'core data', 'rxswift', 'jetpack compose'],
        soft: ['attention to detail', 'user empathy', 'creativity', 'collaboration', 'problem-solving'],
    },
    'Machine Learning Engineer': {
        critical: ['machine learning', 'deep learning', 'model', 'training', 'deployment', 'mlops', 'algorithms'],
        technical: ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'numpy', 'pandas', 'docker', 'kubernetes', 'aws sagemaker', 'mlflow', 'feature engineering', 'nlp', 'computer vision', 'transformers', 'gpu', 'spark', 'airflow'],
        soft: ['analytical', 'research', 'communication', 'problem-solving', 'curiosity', 'mathematical thinking'],
    },
    'Cybersecurity Analyst': {
        critical: ['security', 'vulnerability', 'threat', 'compliance', 'incident response', 'risk assessment', 'penetration testing'],
        technical: ['siem', 'firewall', 'ids', 'ips', 'encryption', 'network security', 'owasp', 'nist', 'iso 27001', 'splunk', 'wireshark', 'metasploit', 'linux', 'python', 'soc', 'zero trust'],
        soft: ['attention to detail', 'analytical', 'communication', 'proactive', 'integrity', 'critical thinking'],
    },
};

// ═══════════════════════════════════════════════════════
// SECTION PATTERNS
// ═══════════════════════════════════════════════════════
const SECTION_PATTERNS = [
    { name: 'Contact Information', patterns: ['email', 'phone', 'linkedin', 'github', 'portfolio', '@', 'http', 'www'], required: true },
    { name: 'Summary / Objective', patterns: ['summary', 'objective', 'profile', 'about me', 'professional summary', 'career objective', 'overview'], required: true },
    { name: 'Work Experience', patterns: ['experience', 'employment', 'work history', 'professional experience', 'career history'], required: true },
    { name: 'Education', patterns: ['education', 'academic', 'degree', 'university', 'college', 'bachelor', 'master', 'phd', 'b.tech', 'b.e', 'm.tech', 'mba'], required: true },
    { name: 'Skills', patterns: ['skills', 'technical skills', 'technologies', 'competencies', 'proficiencies', 'tech stack', 'tools'], required: true },
    { name: 'Projects', patterns: ['projects', 'personal projects', 'side projects', 'portfolio', 'notable projects', 'key projects'], required: false },
    { name: 'Certifications', patterns: ['certifications', 'certificates', 'credentials', 'licensed', 'accreditation', 'certified'], required: false },
    { name: 'Awards', patterns: ['awards', 'honors', 'achievements', 'recognition', 'accomplishments'], required: false },
];

// ═══════════════════════════════════════════════════════
// ACTION VERBS
// ═══════════════════════════════════════════════════════
const STRONG_ACTION_VERBS = [
    'achieved', 'architected', 'automated', 'built', 'consolidated', 'created', 'decreased', 'delivered',
    'designed', 'developed', 'drove', 'engineered', 'enhanced', 'established', 'executed', 'expanded',
    'generated', 'grew', 'implemented', 'improved', 'increased', 'initiated', 'integrated', 'launched',
    'led', 'managed', 'mentored', 'migrated', 'modernized', 'negotiated', 'optimized', 'orchestrated',
    'overhauled', 'pioneered', 'reduced', 'refactored', 'redesigned', 'resolved', 'revamped', 'scaled',
    'shipped', 'simplified', 'spearheaded', 'streamlined', 'strengthened', 'surpassed', 'transformed',
    'upgraded', 'accelerated', 'collaborated',
];

const WEAK_VERBS = [
    'responsible for', 'helped', 'assisted', 'worked on', 'participated', 'involved in', 'handled',
    'tasked with', 'did', 'made', 'got', 'went', 'had', 'was',
];

// ═══════════════════════════════════════════════════════
// ATS RED FLAGS
// ═══════════════════════════════════════════════════════
const ATS_RED_FLAGS = [
    { pattern: /[★☆●◆◇▪▫►▸✦✧⬥⬦❖✪✫✬✭✮✯✰⭐🌟⚡🔥💡🎯📧📱💼🏢]/g, message: 'Contains emoji or special symbols — most ATS parsers cannot read these', severity: 'high' },
    { pattern: /\t{3,}/g, message: 'Excessive tab usage detected — might indicate table-based layout that confuses ATS parsers', severity: 'medium' },
    { pattern: /\|/g, message: 'Pipe characters detected — may indicate column/table formatting incompatible with ATS', severity: 'low' },
    { pattern: /\[image\]|\[logo\]|\[photo\]|\.png|\.jpg|\.jpeg|\.gif|profile photo|headshot/gi, message: 'Image references found — ATS cannot process images and they waste space', severity: 'high' },
    { pattern: /references available|references upon request/gi, message: '"References available upon request" is outdated — remove to save space', severity: 'low' },
];

// ═══════════════════════════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════

function analyzeKeywords(resumeText, targetRole) {
    const roleData = ROLE_KEYWORDS[targetRole];
    if (!roleData) return { score: 0, found: [], missing: [], matchPercent: 0 };

    const lowerText = resumeText.toLowerCase();
    const allKeywords = [...roleData.critical, ...roleData.technical, ...roleData.soft];

    const found = [];
    const missing = [];

    const criticalFound = [];
    const criticalMissing = [];

    roleData.critical.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) {
            found.push({ keyword: kw, category: 'critical' });
            criticalFound.push(kw);
        } else {
            missing.push({ keyword: kw, category: 'critical' });
            criticalMissing.push(kw);
        }
    });

    roleData.technical.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) {
            found.push({ keyword: kw, category: 'technical' });
        } else {
            missing.push({ keyword: kw, category: 'technical' });
        }
    });

    roleData.soft.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) {
            found.push({ keyword: kw, category: 'soft' });
        } else {
            missing.push({ keyword: kw, category: 'soft' });
        }
    });

    const matchPercent = Math.round((found.length / allKeywords.length) * 100);

    // Score: critical keywords weigh more
    const criticalScore = roleData.critical.length > 0
        ? (criticalFound.length / roleData.critical.length) * 40
        : 0;
    const technicalFound = found.filter(f => f.category === 'technical').length;
    const technicalScore = roleData.technical.length > 0
        ? (technicalFound / roleData.technical.length) * 40
        : 0;
    const softFound = found.filter(f => f.category === 'soft').length;
    const softScore = roleData.soft.length > 0
        ? (softFound / roleData.soft.length) * 20
        : 0;

    return {
        score: Math.round(criticalScore + technicalScore + softScore),
        found,
        missing: missing.slice(0, 15), // Top 15 missing
        matchPercent,
        criticalMissing,
    };
}

function analyzeSections(resumeText) {
    const lowerText = resumeText.toLowerCase();
    const results = [];

    SECTION_PATTERNS.forEach(section => {
        const detected = section.patterns.some(p => lowerText.includes(p.toLowerCase()));
        results.push({
            name: section.name,
            detected,
            required: section.required,
        });
    });

    const requiredSections = results.filter(s => s.required);
    const foundRequired = requiredSections.filter(s => s.detected).length;
    const score = requiredSections.length > 0
        ? Math.round((foundRequired / requiredSections.length) * 100)
        : 0;

    return { sections: results, score };
}

function analyzeContentQuality(resumeText) {
    const lines = resumeText.split('\n').filter(l => l.trim().length > 0);
    const lowerText = resumeText.toLowerCase();
    const words = resumeText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Action verbs
    const strongVerbsFound = STRONG_ACTION_VERBS.filter(v => lowerText.includes(v));
    const weakVerbsFound = WEAK_VERBS.filter(v => lowerText.includes(v));

    // Quantified achievements (numbers, percentages, dollar amounts)
    const quantifiedMatches = resumeText.match(/\d+%|\$[\d,]+|\d+x|\d+\+|\d{2,}/g) || [];
    const quantifiedCount = quantifiedMatches.length;

    // Bullet points (lines starting with - or • or *)
    const bulletLines = lines.filter(l => /^[\s]*[-•*▸►]\s/.test(l));
    const bulletRatio = lines.length > 0 ? bulletLines.length / lines.length : 0;

    // Length assessment
    let lengthAssessment;
    if (wordCount < 150) {
        lengthAssessment = { status: 'too_short', message: 'Resume is very short. Aim for 300-700 words for a strong 1-page resume.', penalty: 15 };
    } else if (wordCount < 300) {
        lengthAssessment = { status: 'short', message: 'Resume could use more detail. Consider adding projects or expanding experience.', penalty: 8 };
    } else if (wordCount <= 800) {
        lengthAssessment = { status: 'optimal', message: 'Great length — concise and detailed enough for ATS and recruiters.', penalty: 0 };
    } else if (wordCount <= 1200) {
        lengthAssessment = { status: 'long', message: 'Slightly long. Consider trimming older or less relevant experience.', penalty: 5 };
    } else {
        lengthAssessment = { status: 'too_long', message: 'Resume is too long. Most recruiters spend 6-7 seconds on initial scan — keep it concise.', penalty: 12 };
    }

    // Score calculation
    let score = 50;
    score += Math.min(strongVerbsFound.length * 3, 20);
    score -= Math.min(weakVerbsFound.length * 4, 15);
    score += Math.min(quantifiedCount * 3, 20);
    score += bulletRatio > 0.3 ? 10 : bulletRatio > 0.1 ? 5 : 0;
    score -= lengthAssessment.penalty;
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        wordCount,
        strongVerbsFound,
        weakVerbsFound,
        quantifiedCount,
        bulletRatio: Math.round(bulletRatio * 100),
        lengthAssessment,
        lineCount: lines.length,
    };
}

function checkATSCompatibility(resumeText) {
    const warnings = [];

    ATS_RED_FLAGS.forEach(flag => {
        const matches = resumeText.match(flag.pattern);
        if (matches && matches.length > 0) {
            warnings.push({
                message: flag.message,
                severity: flag.severity,
                count: matches.length,
            });
        }
    });

    // Check for common ATS-unfriendly patterns
    if (resumeText.length > 0 && !resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
        warnings.push({ message: 'No email address detected — ATS requires contact info in plain text', severity: 'high', count: 1 });
    }

    if (resumeText.length > 0 && !resumeText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]?\d{8,}/)) {
        warnings.push({ message: 'No phone number detected — include a contact number for recruiters', severity: 'medium', count: 1 });
    }

    const score = Math.max(0, 100 - warnings.reduce((acc, w) => {
        const penalty = w.severity === 'high' ? 15 : w.severity === 'medium' ? 8 : 4;
        return acc + (penalty * Math.min(w.count, 3));
    }, 0));

    return { warnings, score };
}

function generateTips(targetRole, keywordAnalysis, sectionAnalysis, contentQuality, atsCheck) {
    const tips = [];

    // Role-specific tips
    if (keywordAnalysis.criticalMissing.length > 0) {
        tips.push({
            category: 'Keywords',
            priority: 'high',
            tip: `Add these critical ${targetRole} keywords: ${keywordAnalysis.criticalMissing.slice(0, 5).join(', ')}`,
            impact: 'ATS filters often reject resumes missing key role terms',
        });
    }

    if (keywordAnalysis.matchPercent < 30) {
        tips.push({
            category: 'Keywords',
            priority: 'high',
            tip: 'Your keyword coverage is low. Mirror the language from the job description in your resume.',
            impact: 'Resumes with <30% keyword match are filtered out by most ATS systems',
        });
    }

    // Section tips
    const missingSections = sectionAnalysis.sections.filter(s => s.required && !s.detected);
    if (missingSections.length > 0) {
        tips.push({
            category: 'Structure',
            priority: 'high',
            tip: `Missing required sections: ${missingSections.map(s => s.name).join(', ')}`,
            impact: 'Standard section headers help ATS parse your resume correctly',
        });
    }

    // Content quality tips
    if (contentQuality.weakVerbsFound.length > 2) {
        tips.push({
            category: 'Language',
            priority: 'medium',
            tip: `Replace weak phrases like "${contentQuality.weakVerbsFound.slice(0, 3).join('", "')}" with strong action verbs like "engineered", "optimized", "delivered"`,
            impact: 'Action verbs demonstrate ownership and impact to hiring managers',
        });
    }

    if (contentQuality.quantifiedCount < 3) {
        tips.push({
            category: 'Impact',
            priority: 'high',
            tip: 'Add more quantified achievements (e.g., "Reduced load time by 40%", "Managed team of 8", "Processed 10K+ records daily")',
            impact: 'Quantified results are the #1 factor that makes a resume stand out',
        });
    }

    if (contentQuality.bulletRatio < 20) {
        tips.push({
            category: 'Formatting',
            priority: 'medium',
            tip: 'Use more bullet points to make your experience scannable. Recruiters scan; they don\'t read.',
            impact: 'Bullet points improve readability and ATS parsing accuracy',
        });
    }

    if (contentQuality.strongVerbsFound.length < 5) {
        tips.push({
            category: 'Language',
            priority: 'medium',
            tip: 'Start each bullet point with a strong action verb: built, designed, led, improved, automated, scaled',
            impact: 'Strong verbs convey confidence and capability',
        });
    }

    // ATS tips
    if (atsCheck.warnings.filter(w => w.severity === 'high').length > 0) {
        tips.push({
            category: 'ATS',
            priority: 'high',
            tip: 'Fix critical ATS compatibility issues — your resume may be auto-rejected before a human sees it',
            impact: '75% of resumes are rejected by ATS before reaching a recruiter',
        });
    }

    // General best practices
    if (contentQuality.lengthAssessment.status === 'too_short') {
        tips.push({
            category: 'Content',
            priority: 'high',
            tip: 'Your resume is too brief. Add relevant projects, certifications, or expand on your experience.',
            impact: 'Brief resumes signal lack of experience or effort to recruiters',
        });
    }

    if (!sectionAnalysis.sections.find(s => s.name === 'Projects')?.detected) {
        tips.push({
            category: 'Strategy',
            priority: 'low',
            tip: 'Consider adding a "Projects" section to showcase hands-on work, especially if you have < 3 years of experience',
            impact: 'Personal projects demonstrate initiative and passion',
        });
    }

    return tips.sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return (p[a.priority] || 2) - (p[b.priority] || 2);
    });
}

// ═══════════════════════════════════════════════════════
// API HANDLER
// ═══════════════════════════════════════════════════════
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resumeText, targetRole } = await request.json();

        if (!resumeText || !resumeText.trim()) {
            return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
        }

        if (!targetRole || !ROLE_KEYWORDS[targetRole]) {
            return NextResponse.json({
                error: 'Invalid target role',
                availableRoles: Object.keys(ROLE_KEYWORDS),
            }, { status: 400 });
        }

        // Run analysis
        const keywordAnalysis = analyzeKeywords(resumeText, targetRole);
        const sectionAnalysis = analyzeSections(resumeText);
        const contentQuality = analyzeContentQuality(resumeText);
        const atsCheck = checkATSCompatibility(resumeText);
        const tips = generateTips(targetRole, keywordAnalysis, sectionAnalysis, contentQuality, atsCheck);

        // Calculate overall ATS score
        const overallScore = Math.round(
            (keywordAnalysis.score * 0.35) +
            (sectionAnalysis.score * 0.20) +
            (contentQuality.score * 0.25) +
            (atsCheck.score * 0.20)
        );

        return NextResponse.json({
            overallScore,
            targetRole,
            keywords: keywordAnalysis,
            sections: sectionAnalysis,
            contentQuality,
            atsCompatibility: atsCheck,
            tips,
            availableRoles: Object.keys(ROLE_KEYWORDS),
        });

    } catch (error) {
        console.error('Resume analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}

// GET - return available roles
export async function GET() {
    return NextResponse.json({ roles: Object.keys(ROLE_KEYWORDS) });
}
