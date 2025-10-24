// Test all subjects and output types

const subjects = [
    'Toán',
    'Ngữ văn',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lí',
    'Giáo dục công dân',
    'Công nghệ'
];

const outputTypes = [
    'lesson-plan',
    'presentation',
    'assessment',
    'interactive',
    'research'
];

const gradeLevels = [6, 7, 8, 9];

async function testAllCombinations() {
    console.log('🧪 Testing all subject/grade/output combinations...\n');

    let totalTests = 0;
    let successfulTests = 0;
    let templatesFound = 0;

    for (const subject of subjects) {
        console.log(`📚 Testing subject: ${subject}`);

        for (const gradeLevel of gradeLevels) {
            for (const outputType of outputTypes) {
                totalTests++;

                try {
                    const url = `http://localhost:3000/api/templates?subject=${encodeURIComponent(subject)}&gradeLevel=${gradeLevel}&outputType=${outputType}`;
                    const response = await fetch(url);

                    if (response.ok) {
                        const data = await response.json();
                        successfulTests++;

                        if (data.templates && data.templates.length > 0) {
                            templatesFound += data.templates.length;
                            console.log(`  ✅ Grade ${gradeLevel}, ${outputType}: ${data.templates.length} templates`);

                            // Show template names
                            data.templates.forEach(template => {
                                console.log(`     - ${template.name}`);
                            });
                        } else {
                            console.log(`  ⚪ Grade ${gradeLevel}, ${outputType}: No templates`);
                        }
                    } else {
                        console.log(`  ❌ Grade ${gradeLevel}, ${outputType}: HTTP ${response.status}`);
                    }
                } catch (error) {
                    console.log(`  ❌ Grade ${gradeLevel}, ${outputType}: ${error.message}`);
                }
            }
        }
        console.log(''); // Empty line between subjects
    }

    console.log('📊 TEST SUMMARY:');
    console.log(`Total API calls: ${totalTests}`);
    console.log(`Successful calls: ${successfulTests}`);
    console.log(`Total templates found: ${templatesFound}`);
    console.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
}

// Test specific combinations that should have templates
async function testKnownTemplates() {
    console.log('\n🎯 Testing known template combinations...\n');

    const knownCombinations = [
        { subject: 'Toán', gradeLevel: 6, outputType: 'lesson-plan' },
        { subject: 'Ngữ văn', gradeLevel: 8, outputType: 'lesson-plan' },
        { subject: 'Khoa học tự nhiên', gradeLevel: 6, outputType: 'lesson-plan' },
        { subject: 'Lịch sử & Địa lí', gradeLevel: 7, outputType: 'lesson-plan' },
        { subject: 'Toán', gradeLevel: 8, outputType: 'presentation' }
    ];

    for (const combo of knownCombinations) {
        try {
            const url = `http://localhost:3000/api/templates?subject=${encodeURIComponent(combo.subject)}&gradeLevel=${combo.gradeLevel}&outputType=${combo.outputType}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${combo.subject} - Grade ${combo.gradeLevel} - ${combo.outputType}: ${data.templates?.length || 0} templates`);

                if (data.templates && data.templates.length > 0) {
                    data.templates.forEach(template => {
                        console.log(`   📋 ${template.name}`);
                        console.log(`      Difficulty: ${template.difficulty}`);
                        console.log(`      Variables: ${template.variables?.length || 0}`);
                        console.log(`      Tags: ${template.tags?.join(', ') || 'None'}`);
                        console.log('');
                    });
                }
            } else {
                console.log(`❌ ${combo.subject} - Grade ${combo.gradeLevel} - ${combo.outputType}: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${combo.subject} - Grade ${combo.gradeLevel} - ${combo.outputType}: ${error.message}`);
        }
    }
}

// Run tests
async function runAllTests() {
    await testKnownTemplates();
    await testAllCombinations();
}

runAllTests().catch(console.error);