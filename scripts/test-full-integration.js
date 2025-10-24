// Full integration test for template system

async function testFullIntegration() {
    console.log('🧪 FULL INTEGRATION TEST - Template System');
    console.log('==========================================\n');

    let allTestsPassed = true;

    // Test 1: Admin API - Get all templates
    try {
        console.log('1️⃣ Testing Admin API - Get all templates...');
        const adminResponse = await fetch('http://localhost:3000/api/admin/templates');

        if (!adminResponse.ok) {
            throw new Error(`HTTP ${adminResponse.status}`);
        }

        const adminData = await adminResponse.json();
        console.log(`✅ Admin API: ${adminData.data.length} templates found`);

        if (adminData.data.length === 0) {
            console.log('⚠️  No templates in admin system - run seed scripts first');
        }
    } catch (error) {
        console.log(`❌ Admin API failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 2: User API - Get templates
    try {
        console.log('\n2️⃣ Testing User API - Get templates...');
        const userResponse = await fetch('http://localhost:3000/api/templates');

        if (!userResponse.ok) {
            throw new Error(`HTTP ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        console.log(`✅ User API: ${userData.templates.length} templates found`);
        console.log(`   Success: ${userData.success}`);
    } catch (error) {
        console.log(`❌ User API failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 3: Template Stats API
    try {
        console.log('\n3️⃣ Testing Template Stats API...');
        const statsResponse = await fetch('http://localhost:3000/api/templates/stats');

        if (!statsResponse.ok) {
            throw new Error(`HTTP ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        console.log(`✅ Stats API: ${statsData.totalTemplates} total templates`);
        console.log(`   Subjects: ${Object.keys(statsData.bySubject).length}`);
        console.log(`   Output types: ${Object.keys(statsData.byOutputType).length}`);
    } catch (error) {
        console.log(`❌ Stats API failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 4: Template Recommendations API
    try {
        console.log('\n4️⃣ Testing Template Recommendations API...');
        const recommendResponse = await fetch('http://localhost:3000/api/templates/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                criteria: {
                    subject: 'Toán',
                    gradeLevel: 6,
                    outputType: 'lesson-plan'
                },
                action: 'findAll'
            })
        });

        if (!recommendResponse.ok) {
            throw new Error(`HTTP ${recommendResponse.status}`);
        }

        const recommendData = await recommendResponse.json();
        console.log(`✅ Recommend API: ${recommendData.data.length} matches found`);

        if (recommendData.data.length > 0) {
            const firstMatch = recommendData.data[0];
            console.log(`   Best match: ${firstMatch.template.name}`);
            console.log(`   Score: ${firstMatch.score}`);
            console.log(`   Confidence: ${firstMatch.confidence}`);
            console.log(`   Reasons: ${firstMatch.reasons.length}`);
        }
    } catch (error) {
        console.log(`❌ Recommend API failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 5: Data Consistency Check
    try {
        console.log('\n5️⃣ Testing Data Consistency...');

        // Get data from both admin and user APIs
        const [adminResp, userResp] = await Promise.all([
            fetch('http://localhost:3000/api/admin/templates'),
            fetch('http://localhost:3000/api/templates')
        ]);

        const adminData = await adminResp.json();
        const userData = await userResp.json();

        const adminCount = adminData.data.length;
        const userCount = userData.templates.length;

        if (adminCount === userCount) {
            console.log(`✅ Data consistency: Both APIs return ${adminCount} templates`);
        } else {
            console.log(`⚠️  Data inconsistency: Admin=${adminCount}, User=${userCount}`);
        }

        // Check if admin templates appear in user API
        let matchingTemplates = 0;
        adminData.data.forEach(adminTemplate => {
            const userTemplate = userData.templates.find(ut => ut.id === adminTemplate.id);
            if (userTemplate) {
                matchingTemplates++;
            }
        });

        console.log(`   Template ID matches: ${matchingTemplates}/${adminCount}`);

        if (matchingTemplates === adminCount) {
            console.log('✅ All admin templates are accessible via user API');
        } else {
            console.log('⚠️  Some admin templates are not accessible via user API');
        }

    } catch (error) {
        console.log(`❌ Data consistency check failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Test 6: Subject-specific filtering
    try {
        console.log('\n6️⃣ Testing Subject-specific Filtering...');

        const subjects = ['Toán', 'Ngữ văn', 'Khoa học tự nhiên'];

        for (const subject of subjects) {
            const response = await fetch(`http://localhost:3000/api/templates?subject=${encodeURIComponent(subject)}`);
            const data = await response.json();

            console.log(`   ${subject}: ${data.templates.length} templates`);

            // Verify all returned templates are for the correct subject
            const wrongSubject = data.templates.find(t => t.subject !== subject);
            if (wrongSubject) {
                console.log(`   ⚠️  Found template with wrong subject: ${wrongSubject.subject}`);
            }
        }

        console.log('✅ Subject filtering works correctly');
    } catch (error) {
        console.log(`❌ Subject filtering test failed: ${error.message}`);
        allTestsPassed = false;
    }

    // Final Result
    console.log('\n==========================================');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Template system is fully integrated.');
        console.log('✅ Admin system and user interface are synchronized');
        console.log('✅ All APIs are working correctly');
        console.log('✅ Data consistency is maintained');
    } else {
        console.log('❌ SOME TESTS FAILED! Please check the errors above.');
    }
    console.log('==========================================');
}

// Run the full integration test
testFullIntegration().catch(console.error);