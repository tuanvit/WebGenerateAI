import { NextRequest, NextResponse } from 'next/server';
import { TemplatesRepository } from '@/lib/admin/repositories/templates-repository';
import { SimpleTestRepository } from '@/lib/admin/simple-test-repository';

export async function GET(request: NextRequest) {
    try {
        console.log('Testing repositories...');

        // Test simple repository first
        const simpleRepo = new SimpleTestRepository();
        const simpleResult = await simpleRepo.getTest();
        console.log('Simple repo works:', simpleResult);

        // Test templates repository class
        const newRepository = new TemplatesRepository();
        console.log('New repository type:', typeof newRepository);
        console.log('New repository constructor:', newRepository.constructor.name);
        console.log('New repository methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(newRepository)));

        // Test if getTemplates method exists on new instance
        if (typeof newRepository.getTemplates === 'function') {
            console.log('getTemplates method exists');

            // Try to call it
            const result = await newRepository.getTemplates({ page: 1, limit: 5 });
            console.log('getTemplates result:', result);

            return NextResponse.json({
                success: true,
                message: 'Templates repository working',
                newInstanceType: typeof newRepository,
                result
            });
        } else {
            console.log('getTemplates method does NOT exist');
            return NextResponse.json({
                success: false,
                message: 'getTemplates method not found',
                newInstanceType: typeof newRepository,
                newInstanceConstructor: newRepository.constructor.name,
                newInstanceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(newRepository))
            });
        }
    } catch (error) {
        console.error('Error testing templates repository:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}