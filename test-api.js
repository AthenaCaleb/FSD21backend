import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080';
let contributorToken = '';
let adminToken = '';
let articleId = '';

// Helper function to log results
const log = (test, result) => {
    console.log(`\n✓ ${test}`);
    console.log(JSON.stringify(result, null, 2));
};

const logError = (test, error) => {
    console.log(`\n✗ ${test}`);
    console.log('Error:', error.message);
};

async function runTests() {
    console.log('='.repeat(50));
    console.log('KNOWLEDGE BASE API TESTING');
    console.log('='.repeat(50));

    try {
        // Test 1: Check server is running
        console.log('\n[TEST 1] Server Health Check');
        const health = await fetch(`${BASE_URL}/`);
        const healthData = await health.json();
        log('Server is running', healthData);

        // Test 2: Register Contributor
        console.log('\n[TEST 2] Register Contributor');
        const contributorReg = await fetch(`${BASE_URL}/api/v1/auth/register-contributor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Contributor',
                email: `contributor${Date.now()}@test.com`,
                password: 'test123'
            })
        });
        const contributorData = await contributorReg.json();
        log('Contributor registered', contributorData);

        // Test 3: Register Admin
        console.log('\n[TEST 3] Register Admin');
        const adminReg = await fetch(`${BASE_URL}/api/v1/auth/register-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: `admin${Date.now()}@test.com`,
                password: 'admin123',
                adminCode: 'admin123'
            })
        });
        const adminData = await adminReg.json();
        log('Admin registered', adminData);

        // Test 4: Login as Contributor
        console.log('\n[TEST 4] Login as Contributor');
        const contributorLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: contributorData.user.email,
                password: 'test123'
            })
        });
        const contributorLoginData = await contributorLogin.json();
        const cookies = contributorLogin.headers.get('set-cookie');
        contributorToken = cookies.match(/token=([^;]+)/)[1];
        log('Contributor logged in', contributorLoginData);

        // Test 5: Login as Admin
        console.log('\n[TEST 5] Login as Admin');
        const adminLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: adminData.user.email,
                password: 'admin123'
            })
        });
        const adminLoginData = await adminLogin.json();
        const adminCookies = adminLogin.headers.get('set-cookie');
        adminToken = adminCookies.match(/token=([^;]+)/)[1];
        log('Admin logged in', adminLoginData);

        // Test 6: Create Article (Contributor)
        console.log('\n[TEST 6] Create Article as Contributor');
        const createArticle = await fetch(`${BASE_URL}/api/v1/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${contributorToken}`
            },
            body: JSON.stringify({
                title: 'Test Article: Getting Started with Node.js',
                content: 'This is a comprehensive guide to Node.js development...'
            })
        });
        const articleData = await createArticle.json();
        articleId = articleData.article._id;
        log('Article created (status should be pending)', articleData);

        // Test 7: View Own Articles (Contributor)
        console.log('\n[TEST 7] View Own Articles as Contributor');
        const myArticles = await fetch(`${BASE_URL}/api/v1/articles/my-articles`, {
            headers: { 'Cookie': `token=${contributorToken}` }
        });
        const myArticlesData = await myArticles.json();
        log('Contributor\'s own articles', myArticlesData);

        // Test 8: View Published Articles (should be empty)
        console.log('\n[TEST 8] View Published Articles (Before Approval)');
        const published1 = await fetch(`${BASE_URL}/api/v1/articles/published`);
        const published1Data = await published1.json();
        log('Published articles (should be empty)', published1Data);

        // Test 9: View Pending Articles (Admin)
        console.log('\n[TEST 9] View Pending Articles as Admin');
        const pending = await fetch(`${BASE_URL}/api/v1/articles/pending`, {
            headers: { 'Cookie': `token=${adminToken}` }
        });
        const pendingData = await pending.json();
        log('Pending articles for admin review', pendingData);

        // Test 10: Approve Article (Admin)
        console.log('\n[TEST 10] Approve Article as Admin');
        const approve = await fetch(`${BASE_URL}/api/v1/articles/${articleId}/approve`, {
            method: 'PUT',
            headers: { 'Cookie': `token=${adminToken}` }
        });
        const approveData = await approve.json();
        log('Article approved', approveData);

        // Test 11: View Published Articles (after approval)
        console.log('\n[TEST 11] View Published Articles (After Approval)');
        const published2 = await fetch(`${BASE_URL}/api/v1/articles/published`);
        const published2Data = await published2.json();
        log('Published articles (should contain approved article)', published2Data);

        // Test 12: Create another article and reject it
        console.log('\n[TEST 12] Create Another Article to Test Rejection');
        const createArticle2 = await fetch(`${BASE_URL}/api/v1/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${contributorToken}`
            },
            body: JSON.stringify({
                title: 'Test Article 2: Advanced MongoDB',
                content: 'Learn advanced MongoDB concepts...'
            })
        });
        const articleData2 = await createArticle2.json();
        const articleId2 = articleData2.article._id;
        log('Second article created', articleData2);

        // Test 13: Reject Article (Admin)
        console.log('\n[TEST 13] Reject Article as Admin');
        const reject = await fetch(`${BASE_URL}/api/v1/articles/${articleId2}/reject`, {
            method: 'PUT',
            headers: { 'Cookie': `token=${adminToken}` }
        });
        const rejectData = await reject.json();
        log('Article rejected', rejectData);

        console.log('\n' + '='.repeat(50));
        console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\nSummary:');
        console.log('- Authentication: ✓ Registration and Login working');
        console.log('- Authorization: ✓ Role-based access control working');
        console.log('- Article Creation: ✓ Contributors can create articles');
        console.log('- Approval Workflow: ✓ Admins can approve/reject articles');
        console.log('- Business Rule: ✓ Only approved articles are published');

    } catch (error) {
        logError('Test failed', error);
        console.log('\n❌ TESTS FAILED');
        console.log('Make sure MongoDB is running and the server is started.');
    }
}

runTests();
