// Test updating template with variables

async function testUpdateTemplate() {
    try {
        console.log('🧪 Testing template update with variables...');

        // First, get a template to update
        const getResponse = await fetch('http://localhost:3000/api/admin/templates');
        const templates = await getResponse.json();

        if (!templates.data || templates.data.length === 0) {
            console.log('❌ No templates found to update');
            return;
        }

        const templateToUpdate = templates.data[0];
        console.log(`📋 Updating template: ${templateToUpdate.name} (ID: ${templateToUpdate.id})`);

        // Prepare update data with variables
        const updateData = {
            name: templateToUpdate.name + ' - Updated',
            description: templateToUpdate.description + ' (Updated)',
            variables: [
                {
                    name: 'testVariable',
                    label: 'Test Variable',
                    description: 'This is a test variable',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter test value',
                    defaultValue: 'default test value'
                },
                {
                    name: 'optionalVariable',
                    label: 'Optional Variable',
                    description: null,
                    type: 'textarea',
                    required: false,
                    placeholder: null,
                    defaultValue: null
                }
            ]
        };

        console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

        // Update the template
        const updateResponse = await fetch(`http://localhost:3000/api/admin/templates/${templateToUpdate.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`HTTP ${updateResponse.status}: ${errorText}`);
        }

        const updatedTemplate = await updateResponse.json();
        console.log('✅ Template updated successfully!');
        console.log(`📋 Updated name: ${updatedTemplate.name}`);
        console.log(`📊 Variables count: ${updatedTemplate.variables?.length || 0}`);

        if (updatedTemplate.variables) {
            console.log('📝 Variables:');
            updatedTemplate.variables.forEach((variable, index) => {
                console.log(`  ${index + 1}. ${variable.name} (${variable.type})`);
                console.log(`     Label: ${variable.label}`);
                console.log(`     Required: ${variable.required}`);
                console.log(`     Default: ${variable.defaultValue || 'null'}`);
                console.log('');
            });
        }

        // Verify the update by fetching the template again
        console.log('\n🔍 Verifying update...');
        const verifyResponse = await fetch(`http://localhost:3000/api/admin/templates/${templateToUpdate.id}`);
        const verifiedTemplate = await verifyResponse.json();

        console.log(`✅ Verified name: ${verifiedTemplate.name}`);
        console.log(`✅ Verified variables count: ${verifiedTemplate.variables?.length || 0}`);

    } catch (error) {
        console.error('❌ Error testing template update:', error.message);
    }
}

testUpdateTemplate();