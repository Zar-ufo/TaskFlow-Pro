import { prisma } from './db.js';
async function main() {
    // idempotent-ish seed
    const you = await prisma.user.upsert({
        where: { email: 'you@taskflow.pro' },
        update: {
            name: 'You',
            avatar: '👤',
            role: 'admin',
            status: 'online',
        },
        create: {
            name: 'You',
            email: 'you@taskflow.pro',
            avatar: '👤',
            role: 'admin',
            status: 'online',
        },
    });
    const sarah = await prisma.user.upsert({
        where: { email: 'sarah@taskflow.pro' },
        update: {
            name: 'Sarah Chen',
            avatar: '👩‍💻',
            role: 'member',
            status: 'online',
        },
        create: {
            name: 'Sarah Chen',
            email: 'sarah@taskflow.pro',
            avatar: '👩‍💻',
            role: 'member',
            status: 'online',
        },
    });
    const mike = await prisma.user.upsert({
        where: { email: 'mike@taskflow.pro' },
        update: {
            name: 'Mike Johnson',
            avatar: '👨‍🎨',
            role: 'member',
            status: 'away',
        },
        create: {
            name: 'Mike Johnson',
            email: 'mike@taskflow.pro',
            avatar: '👨‍🎨',
            role: 'member',
            status: 'away',
        },
    });
    const emily = await prisma.user.upsert({
        where: { email: 'emily@taskflow.pro' },
        update: {
            name: 'Emily Davis',
            avatar: '👩‍🔬',
            role: 'viewer',
            status: 'offline',
        },
        create: {
            name: 'Emily Davis',
            email: 'emily@taskflow.pro',
            avatar: '👩‍🔬',
            role: 'viewer',
            status: 'offline',
        },
    });
    const ws1 = await prisma.workspace.upsert({
        where: { id: 'ws_product_launch_q1' },
        update: {},
        create: {
            id: 'ws_product_launch_q1',
            name: 'Product Launch Q1',
            description: 'All tasks related to the Q1 product launch',
            color: '#6366f1',
            ownerId: you.id,
            members: {
                create: [
                    { userId: you.id, role: 'admin' },
                    { userId: sarah.id, role: 'member' },
                    { userId: mike.id, role: 'member' },
                    { userId: emily.id, role: 'viewer' },
                ],
            },
        },
    });
    const ws2 = await prisma.workspace.upsert({
        where: { id: 'ws_study_group_cs301' },
        update: {},
        create: {
            id: 'ws_study_group_cs301',
            name: 'Study Group - CS301',
            description: 'Collaborative workspace for CS301 course',
            color: '#10b981',
            ownerId: you.id,
            members: {
                create: [
                    { userId: you.id, role: 'admin' },
                    { userId: sarah.id, role: 'member' },
                ],
            },
        },
    });
    const categories = [
        { id: 'cat_dev', name: 'Development', color: '#6366f1', icon: '💻', workspaceId: ws1.id },
        { id: 'cat_design', name: 'Design', color: '#d946ef', icon: '🎨', workspaceId: ws1.id },
        { id: 'cat_research', name: 'Research', color: '#10b981', icon: '🔬', workspaceId: ws1.id },
        { id: 'cat_marketing', name: 'Marketing', color: '#f59e0b', icon: '📢', workspaceId: ws1.id },
        { id: 'cat_meetings', name: 'Meetings', color: '#ef4444', icon: '📅', workspaceId: ws1.id },
        { id: 'cat_personal', name: 'Personal', color: '#06b6d4', icon: '🏠', workspaceId: ws2.id },
        { id: 'cat_research_ws2', name: 'Research', color: '#10b981', icon: '🔬', workspaceId: ws2.id },
    ];
    for (const c of categories) {
        await prisma.category.upsert({
            where: { id: c.id },
            update: {
                name: c.name,
                color: c.color,
                icon: c.icon,
                workspaceId: c.workspaceId,
            },
            create: c,
        });
    }
    // Tasks (a few)
    await prisma.task.upsert({
        where: { id: 'task_dashboard_ui' },
        update: {},
        create: {
            id: 'task_dashboard_ui',
            title: 'Design new dashboard UI',
            description: 'Create wireframes and mockups for the new analytics dashboard',
            status: 'in_progress',
            priority: 'high',
            categoryId: 'cat_design',
            dueDate: new Date('2026-01-05'),
            tags: ['ui', 'dashboard', 'priority'],
            progress: 50,
            workspaceId: ws1.id,
            assigneeId: sarah.id,
            subtasks: {
                create: [
                    { title: 'Research competitors', completed: true },
                    { title: 'Create wireframes', completed: true },
                    { title: 'Design mockups', completed: false },
                    { title: 'Get stakeholder feedback', completed: false },
                ],
            },
        },
    });
    await prisma.task.upsert({
        where: { id: 'task_auth' },
        update: {},
        create: {
            id: 'task_auth',
            title: 'Implement authentication system',
            description: 'Set up OAuth 2.0 and JWT token-based authentication',
            status: 'todo',
            priority: 'urgent',
            categoryId: 'cat_dev',
            dueDate: new Date('2026-01-03'),
            tags: ['backend', 'security', 'auth'],
            progress: 0,
            workspaceId: ws1.id,
            assigneeId: you.id,
            subtasks: {
                create: [
                    { title: 'Set up OAuth providers', completed: false },
                    { title: 'Implement JWT handling', completed: false },
                    { title: 'Add refresh token logic', completed: false },
                ],
            },
        },
    });
    await prisma.task.upsert({
        where: { id: 'task_study_ch5' },
        update: {},
        create: {
            id: 'task_study_ch5',
            title: 'Study Chapter 5 - Algorithms',
            description: 'Complete reading and exercises for algorithms chapter',
            status: 'in_progress',
            priority: 'high',
            categoryId: 'cat_research_ws2',
            dueDate: new Date('2026-01-04'),
            tags: ['study', 'cs301', 'algorithms'],
            progress: 50,
            workspaceId: ws2.id,
            assigneeId: you.id,
            subtasks: {
                create: [
                    { title: 'Read chapter', completed: true },
                    { title: 'Take notes', completed: true },
                    { title: 'Complete exercises 1-10', completed: false },
                    { title: 'Review with study group', completed: false },
                ],
            },
        },
    });
    await prisma.activity.createMany({
        data: [
            {
                id: 'act_task_completed',
                type: 'task_completed',
                userId: you.id,
                taskId: 'task_auth',
                workspaceId: ws1.id,
                message: 'Seeded activity: completed a task',
            },
        ],
        skipDuplicates: true,
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
