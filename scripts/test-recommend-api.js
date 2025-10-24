// Test recommend API

const testCriteria = {
    subject: 'Toán',
    gradeLevel: 6,
    outputType: 'lesson-plan',
    difficulty: 'intermediate'
};

async function testRecommendAPI() {
    try {
        console.log('🧪 Testing recommend API...');
        console.log('Criteria:', testCriteria);

        const response = await fetch('http://localhost:3000/api/templates/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                criteria: testCriteria,
                action: 'findAll'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ API Response:');
        console.log('Success:', result.success);
        console.log('Templates found:', result.data?.length || 0);

        if (result.data && result.data.length > 0) {
            console.log('\n📋 Templates:');
            result.data.forEach((match, index) => {
                const template = match.template;
                console.log(`${index + 1}. ${template.name}`);
                console.log(`   Subject: ${template.subject}`);
                console.log(`   Grade: ${template.gradeLevel}`);
                console.log(`   Type: ${template.outputType}`);
                console.log(`   Difficulty: ${template.difficulty}`);
                console.log(`   Score: ${match.score}`);
                console.log(`   Confidence: ${match.confidence}`);
                console.log(`   Reasons: ${match.reasons.join(', ')}`);
                console.log('');
            });
        }

        if (result.meta) {
            console.log('Meta:', result.meta);
        }

    } catch (error) {
        console.error('❌ Error testing recommend API:', error.message);
    }
}

// Test direct templates API too
async function testDirectAPI() {
    try {
        console.log('\n🔍 Testing direct templates API...');

        const response = await fetch('http://localhost:3000/api/templates?subject=Toán&gradeLevel=6&outputType=lesson-plan');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Direct API Response:');
        console.log('Success:', result.success);
        console.log('Templates found:', result.templates?.length || 0);

        if (result.templates && result.templates.length > 0) {
            console.log('\n📋 Direct Templates:');
            result.templates.forEach((template, index) => {
                console.log(`${index + 1}. ${template.name}`);
                console.log(`   Subject: ${template.subject}`);
                console.log(`   Grade: ${template.gradeLevel}`);
                console.log(`   Type: ${template.outputType}`);
                console.log(`   Difficulty: ${template.difficulty}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error testing direct API:', error.message);
    }
}

async function runTests() {
    await testDirectAPI();
    await testRecommendAPI();
}

runTests();