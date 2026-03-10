const fetch = require('node-fetch');

async function test() {
    const res = await fetch('http://localhost:3000/api/creator/q-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            course: 'MBBS',
            department: 'Anatomy',
            topics: 'Upper Limb',
            totalMarks: 10,
            frames: [{ id: '1', questionNo: 1, mainOrSub: 'Main', type: 'Simple Essay', marks: 10, subdivided: false }]
        })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
}
test();
