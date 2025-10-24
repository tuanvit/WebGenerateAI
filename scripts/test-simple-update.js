// Simple test for template update

async function testSimpleUpdate() {
    try {
        console.log('🧪 Simple template update test...');

        // Get first template
        const response = await fetch('http://localhost:3000/api/admin/templates');
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            console.log('❌ No templates found');
            return;
        }

        const template = data.data[0];
        console.log(`📋 Template: ${template.name} (${template.id})`);

        // Simple update - just change name
        const updateData = {
            name: template.name + ' - Test Update',
            variables: [
                {
                    name: 'simpleVar',
                    label: 'Simple Variable',
                    type: 'text',
                    required: true,
                    defaultValue: 'test value'
                }
            ]
        };

        console.log('📝 Updating with:', JSON.stringify(updateData, null, 2));

        const updateResponse = await fetch(`http://localhost:3000/api/admin/templates/${template.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.log(`❌ Update failed: ${updateResponse.status} - ${errorText}`);
            return;
        }

        const result = await updateResponse.json();
        console.log('✅ Update successful!');
        console.log(`📋 New name: ${result.name}`);
        console.log(`📊 Variables: ${result.variables?.length || 0}`);

        if (result.variables) {
            result.variables.forEach(v => {
                console.log(`   - ${v.name}: ${v.defaultValue}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSimpleUpdate();