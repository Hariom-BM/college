// Simple test script to see RAG API output
const testQuestion = async () => {
  try {
    console.log('🤖 Asking question: "What is artificial intelligence?"');
    
    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "What is artificial intelligence?",
        k: 3
      })
    });
    
    const result = await response.json();
    
    console.log('\n📋 Full API Response:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(result, null, 2));
    
    if (result.answer) {
      console.log('\n🤖 AI Answer:');
      console.log('='.repeat(50));
      console.log(result.answer);
    }
    
    if (result.sources && result.sources.length > 0) {
      console.log('\n📚 Sources:');
      console.log('='.repeat(50));
      result.sources.forEach(source => {
        console.log(`Source ${source.source}: ${source.source_id} (distance: ${source.distance.toFixed(4)})`);
      });
    } else {
      console.log('\n📚 No sources found (database might be empty)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Test health endpoint first
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const result = await response.json();
    console.log('🏥 Health check:', result);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
};

// Run tests
console.log('Testing RAG API...\n');
testHealth().then(() => {
  setTimeout(testQuestion, 1000);
});
