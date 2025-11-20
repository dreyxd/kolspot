import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function createTestCompetition() {
  try {
    console.log('Creating test competition...\n');
    
    // Calculate dates: starts now, ends in 7 days
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7);
    
    const competitionData = {
      name: '1 SOL Challenge – Week 01',
      status: 'active', // Set to active so users can register immediately
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalPrizePoolSol: 1.0
    };
    
    console.log('Competition details:');
    console.log('  Name:', competitionData.name);
    console.log('  Status:', competitionData.status);
    console.log('  Start:', startTime.toLocaleString());
    console.log('  End:', endTime.toLocaleString());
    console.log('  Prize Pool:', competitionData.totalPrizePoolSol, 'SOL\n');
    
    const response = await fetch(`${API_BASE}/api/competition/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(competitionData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create competition: ${error}`);
    }
    
    const result = await response.json();
    
    console.log('✓ Competition created successfully!');
    console.log('  ID:', result.competition.id);
    console.log('  Name:', result.competition.name);
    console.log('  Status:', result.competition.status);
    console.log('\nCompetition is now ACTIVE and ready for registrations!');
    console.log('Visit http://localhost:5173 to see it on your website.\n');
    
  } catch (error) {
    console.error('✗ Error creating competition:', error.message);
    process.exit(1);
  }
}

createTestCompetition();
