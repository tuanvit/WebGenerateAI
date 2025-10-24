// Test template update with null values

async function testNullValues() {
    try {
        console.log('🧪 Testing template update with null values...');

        // Get first template
        const response = await fetch('http://localhost:3000/api/admin/templates');
        const data = await response.json();

        const template = data.data[0];
        console.log(`📋 Template: ${template.name} (${template.id})`);

        // Update with null values
        const updateData = {
            name: template.name + ' - Null Test',
            variables: [
                {
                    name: 'requiredVar',
                    label: 'Required Variable',
                    description: 'This has description',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter value',
                    defaultValue: 'default'
                },
                {
                    name: 'optionalVar',
                    label: 'Optional Variable',
                    description: null,
                    type: 'textarea',
                    required: false,
                    placeholder: null,
                    defaultValue: null
                }
            ]
        };

        console.log('📝 Updating with null values...');

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
        console.log('✅ Update with null values successful!');
        console.log(`📋 New name: ${result.name}`);
        console.log(`📊 Variables: ${result.variables?.length || 0}`);

        if (result.variables) {
            result.variables.forEach(v => {
                console.log(`   - ${v.name}:`);
                console.log(`     Description: ${v.description || 'null'}`);
                console.log(`     Placeholder: ${v.placeholder || 'null'}`);
                console.log(`     Default: ${v.defaultValue || 'null'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testNullValues();