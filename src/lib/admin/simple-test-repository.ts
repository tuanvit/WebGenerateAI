export class SimpleTestRepository {
    async getTest(): Promise<string> {
        return 'test works';
    }
}

export default new SimpleTestRepository();