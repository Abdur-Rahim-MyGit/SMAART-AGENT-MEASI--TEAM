const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const ROLE_DB_PATH = path.join(__dirname, 'data', 'role_skills_db.json');

async function seed() {
  console.log('🚀 Starting SMAART Database Seed...');
  
  if (!fs.existsSync(ROLE_DB_PATH)) {
    console.error('❌ Error: role_skills_db.json not found in backend/data/');
    process.exit(1);
  }

  const roleData = JSON.parse(fs.readFileSync(ROLE_DB_PATH, 'utf8'));
  const roles = Object.keys(roleData);
  let count = 0;

  for (const roleTitle of roles) {
    const data = roleData[roleTitle];
    
    // 1. Upsert the Role
    const roleRecord = await prisma.role.upsert({
      where: { title: roleTitle },
      update: {},
      create: { title: roleTitle }
    });

    // 2. Process Technical Skills
    if (data.tech_skills) {
      for (const s of data.tech_skills) {
        // Upsert Skill
        const skillRecord = await prisma.skill.upsert({
          where: { name: s.skill_name },
          update: { category: 'technical' },
          create: { name: s.skill_name, category: 'technical' }
        });

        // Link Role and Skill via RoleSkill
        await prisma.roleSkill.upsert({
          where: {
            roleId_skillId: {
              roleId: roleRecord.id,
              skillId: skillRecord.id
            }
          },
          update: { priority: s.priority || 'MEDIUM' },
          create: {
            roleId: roleRecord.id,
            skillId: skillRecord.id,
            priority: s.priority || 'MEDIUM'
          }
        });
      }
    }

    count++;
    if (count % 10 === 0) {
      console.log(`✨ Progress: Seeded ${count}/${roles.length} roles...`);
    }
  }

  console.log(`\n🏆 Seed Complete. ${count} roles and their skills are now in PostgreSQL.`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
