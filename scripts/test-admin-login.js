// Test admin login and access

async function testAdminLogin() {
    try {
        console.log('🧪 Testing admin login and access...');

        // Step 1: Login as admin
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await fetch('http://localhost:3000/api/simple-auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'demo123'
            })
        });

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);

        // Get the session cookie
        const setCookieHeader = loginResponse.headers.get('set-cookie');
        console.log('🍪 Session cookie:', setCookieHeader ? 'Set' : 'Not set');

        if (!setCookieHeader) {
            throw new Error('No session cookie received');
        }

        // Extract cookie value
        const cookieMatch = setCookieHeader.match(/simple-auth-session=([^;]+)/);
        if (!cookieMatch) {
            throw new Error('Could not extract session cookie');
        }

        const sessionCookie = cookieMatch[1];
        console.log('   Cookie value:', sessionCookie.substring(0, 20) + '...');

        // Step 2: Test admin API access
        console.log('\n2️⃣ Testing admin API access...');
        const adminResponse = await fetch('http://localhost:3000/api/admin/templates', {
            headers: {
                'Cookie': `simple-auth-session=${sessionCookie}`
            }
        });

        if (!adminResponse.ok) {
            const errorText = await adminResponse.text();
            console.log(`❌ Admin API failed: ${adminResponse.status} - ${errorText}`);
            return;
        }

        const adminData = await adminResponse.json();
        console.log('✅ Admin API access successful!');
        console.log(`   Templates found: ${adminData.data?.length || 0}`);

        // Step 3: Test admin page access
        console.log('\n3️⃣ Testing admin page access...');
        const pageResponse = await fetch('http://localhost:3000/admin/templates', {
            headers: {
                'Cookie': `simple-auth-session=${sessionCookie}`
            }
        });

        if (pageResponse.ok) {
            console.log('✅ Admin page access successful!');
        } else {
            console.log(`⚠️  Admin page returned: ${pageResponse.status}`);
        }

        console.log('\n🎉 Admin login test completed successfully!');
        console.log('You can now access admin interface at: http://localhost:3000/admin/templates');

    } catch (error) {
        console.error('❌ Admin login test failed:', error.message);
    }
}

testAdminLogin();