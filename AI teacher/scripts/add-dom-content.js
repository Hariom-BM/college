// Script to add DOM content to database
import 'dotenv/config';
import { query } from '../src/db.js';

const domContent = [
    {
        source_id: "javascript-dom",
        chunk_id: "javascript-dom::1",
        text: "The Document Object Model (DOM) is a programming interface for HTML and XML documents. Selecting Elements: document.getElementById('myId'); document.querySelector('.myClass'); document.querySelectorAll('p');",
        tags: ["dom", "selectors"],
        start_offset: 0,
        end_offset: 200
    },
    {
        source_id: "javascript-dom",
        chunk_id: "javascript-dom::2",
        text: "Modifying Content: element.innerHTML = 'New content'; element.textContent = 'Plain text'; element.setAttribute('class', 'newClass'); Creating Elements: const newDiv = document.createElement('div');",
        tags: ["dom", "modification"],
        start_offset: 201,
        end_offset: 400
    },
    {
        source_id: "javascript-dom",
        chunk_id: "javascript-dom::3",
        text: "Event Handling: element.addEventListener('click', function(event) { console.log('Clicked!'); event.preventDefault(); }); DOM Traversal: element.parentNode; element.children;",
        tags: ["dom", "events"],
        start_offset: 401,
        end_offset: 600
    },
    {
        source_id: "javascript-dom",
        chunk_id: "javascript-dom::4",
        text: "Style Manipulation: element.style.backgroundColor = 'red'; element.style.fontSize = '16px'; element.classList.add('active'); element.classList.remove('inactive');",
        tags: ["dom", "styling"],
        start_offset: 601,
        end_offset: 800
    },
    {
        source_id: "javascript-dom",
        chunk_id: "javascript-dom::5",
        text: "Form Handling: const form = document.querySelector('form'); form.addEventListener('submit', function(e) { e.preventDefault(); const formData = new FormData(form); console.log(formData.get('username')); });",
        tags: ["dom", "forms"],
        start_offset: 801,
        end_offset: 1000
    }
];

// Create a 768-dimensional vector (for Gemini)
function createVector() {
    const vector = [];
    for (let i = 0; i < 768; i++) {
        vector.push((Math.random() - 0.5) * 2); // Random values between -1 and 1
    }
    return vector;
}

async function addDOMContent() {
    try {
        console.log('Adding JavaScript DOM content to database...');
        
        // Clear existing DOM content first
        await query('DELETE FROM doc_chunks WHERE source_id = $1', ['javascript-dom']);
        console.log('✅ Cleared existing DOM content');
        
        // Insert new content
        for (const content of domContent) {
            const embedding = createVector();
            const embStr = `[${embedding.join(',')}]`;
            
            await query(`
                INSERT INTO doc_chunks (source_id, chunk_id, text, tags, start_offset, end_offset, embedding)
                VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
            `, [content.source_id, content.chunk_id, content.text, content.tags, content.start_offset, content.end_offset, embStr]);
            
            console.log(`✅ Inserted: ${content.chunk_id}`);
        }
        
        console.log('🎉 DOM content added successfully!');
        
        // Check total chunks now
        const countResult = await query(`
            SELECT source_id, COUNT(*) as chunk_count
            FROM doc_chunks 
            GROUP BY source_id
        `);
        
        console.log('\n📊 Current Database Status:');
        countResult.rows.forEach(row => {
            console.log(`   ${row.source_id}: ${row.chunk_count} chunks`);
        });
        
    } catch (error) {
        console.error('❌ Error adding DOM content:', error.message);
    } finally {
        process.exit(0);
    }
}

addDOMContent();
