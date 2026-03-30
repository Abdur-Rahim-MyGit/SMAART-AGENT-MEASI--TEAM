const { processCareerIntelligence, calculateSkillGaps, determineZone } = require('../engine');

describe('SMAART Career Intelligence Engine', () => {
  
  describe('calculateSkillGaps', () => {
    const mockRoleData = {
      tech_skills: [
        { skill_name: 'Python', priority: 'High' },
        { skill_name: 'SQL', priority: 'High' },
        { skill_name: 'Tableau', priority: 'Medium' }
      ]
    };

    test('should identify no missing skills when student has all required skills', () => {
      const studentSkills = ['Python', 'SQL', 'Tableau'];
      const result = calculateSkillGaps(studentSkills, mockRoleData);
      expect(result.missingSkills).toHaveLength(0);
      expect(result.mathingSkills).toEqual(['Python', 'SQL', 'Tableau']);
    });

    test('should identify all required skills as missing when student has no matching skills', () => {
      const studentSkills = ['Cooking', 'Design'];
      const result = calculateSkillGaps(studentSkills, mockRoleData);
      expect(result.missingSkills).toHaveLength(3);
      expect(result.mathingSkills).toHaveLength(0);
    });

    test('should correctly split matched and missing skills', () => {
      const studentSkills = ['python', 'marketing']; // Mixed case and partial match
      const result = calculateSkillGaps(studentSkills, mockRoleData);
      expect(result.mathingSkills).toContain('Python');
      expect(result.missingSkills).toHaveLength(2);
      expect(result.missingSkills.map(s => s.skill_name)).toContain('SQL');
      expect(result.missingSkills.map(s => s.skill_name)).toContain('Tableau');
    });
  });

  describe('determineZone', () => {
    test('should return Green for score >= 0.6', () => {
      expect(determineZone(0.7).zone).toBe('Green');
      expect(determineZone(0.6).zone).toBe('Green');
    });

    test('should return Amber for score between 0.3 and 0.59', () => {
      expect(determineZone(0.4).zone).toBe('Amber');
      expect(determineZone(0.3).zone).toBe('Amber');
    });

    test('should return Red for score < 0.3', () => {
      expect(determineZone(0.25).zone).toBe('Red');
      expect(determineZone(0.1).zone).toBe('Red');
    });
  });

  describe('processCareerIntelligence (Core Analysis)', () => {
    test('should return a valid analysis object for a standard student profile', async () => {
      const mockStudent = {
        name: 'Test Student',
        education: [{ degreeGroup: 'Bachelor of Technology', specialization: 'Computer Science' }],
        skills: ['Python', 'JavaScript'],
        preferences: {
          primary: { role: 'Software Engineer' },
          secondary: { role: 'Data Analyst' },
          tertiary: { role: 'DevOps Engineer' }
        }
      };

      const result = await processCareerIntelligence(mockStudent);
      
      expect(result.status).toBeDefined();
      expect(result.preVerified).toBeDefined();
      expect(result.preVerified.primarySkillGap).toBeDefined();
      expect(result.preVerified.primarySkillGap.coveragePct).toBeGreaterThanOrEqual(0);
      expect(result.combined_tab4).toBeDefined();
      expect(result.combined_tab4.learning_roadmap).toHaveLength(4);
    });
  });
});
