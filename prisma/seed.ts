import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gsd.com' },
    update: {},
    create: {
      email: 'admin@gsd.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const member = await prisma.user.upsert({
    where: { email: 'member@gsd.com' },
    update: {},
    create: {
      email: 'member@gsd.com',
      name: 'Team Member',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Rebrand',
      description: 'Redesign mobile application',
      color: '#007BFF',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Update company website',
      color: '#05CD99',
    },
  })

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Architecture Review for Project Zenith',
      description: 'Review and document the current architecture',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 0,
      dueDate: new Date('2026-10-24'),
      projectId: project1.id,
      createdById: admin.id,
      assigneeId: admin.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'API Integration for Payment Gateway',
      description: 'Integrate Stripe payment processing',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      position: 0,
      dueDate: new Date('2026-10-26'),
      projectId: project1.id,
      createdById: admin.id,
      assigneeId: member.id,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Final Branding Assets Approval',
      description: 'Review and approve final design assets',
      status: 'REVIEW',
      priority: 'HIGH',
      position: 0,
      projectId: project2.id,
      createdById: admin.id,
      assigneeId: admin.id,
    },
  })

  const task4 = await prisma.task.create({
    data: {
      title: 'Onboarding Flow Documentation',
      description: 'Document the complete onboarding process',
      status: 'DONE',
      priority: 'LOW',
      position: 0,
      dueDate: new Date('2026-10-20'),
      projectId: project1.id,
      createdById: admin.id,
      assigneeId: member.id,
    },
  })

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      action: 'CREATED',
      taskId: task1.id,
      userId: admin.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: 'ASSIGNED',
      details: JSON.stringify({ assignedTo: member.name }),
      taskId: task2.id,
      userId: admin.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: 'CREATED',
      taskId: task3.id,
      userId: admin.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: 'CREATED',
      taskId: task4.id,
      userId: member.id,
    },
  })

  // Create automation rules
  await prisma.automationRule.create({
    data: {
      name: 'Task Assignment Notification',
      trigger: 'task.assigned',
      action: 'send_email',
      enabled: true,
      config: JSON.stringify({ template: 'taskAssigned' }),
    },
  })

  await prisma.automationRule.create({
    data: {
      name: 'Status Change Notification',
      trigger: 'task.status_changed',
      action: 'send_email',
      enabled: true,
      config: JSON.stringify({ template: 'statusChanged' }),
    },
  })

  console.log('Database seeded successfully!')
  console.log('Login credentials:')
  console.log('Admin: admin@gsd.com / password123')
  console.log('Member: member@gsd.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
