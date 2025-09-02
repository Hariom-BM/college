// Manual insert script to add JavaScript content directly to database
import 'dotenv/config';
import { query } from '../src/db.js';

const javascriptContent = [
    {
        source_id: "javascript-basics",
        chunk_id: "javascript-basics::1",
        text: "JavaScript is a programming language used for web development. Variables: let name = 'John'; const age = 25; var oldWay = 'not recommended';",
        tags: ["basics", "variables"],
        start_offset: 0,
        end_offset: 120
    },
    {
        source_id: "javascript-basics",
        chunk_id: "javascript-basics::2",
        text: "Data Types: String: 'Hello World', Number: 42, 3.14, Boolean: true, false, Array: [1, 2, 3], Object: {name: 'John', age: 25}",
        tags: ["basics", "data-types"],
        start_offset: 121,
        end_offset: 250
    },
    {
        source_id: "javascript-basics",
        chunk_id: "javascript-basics::3",
        text: "Functions: function greet(name) { return 'Hello ' + name; } Arrow Functions: const greet = (name) => 'Hello ' + name;",
        tags: ["basics", "functions"],
        start_offset: 251,
        end_offset: 380
    },
    {
        source_id: "javascript-basics",
        chunk_id: "javascript-basics::4",
        text: "Arrays: const fruits = ['apple', 'banana']; fruits.push('orange'); fruits.forEach(fruit => console.log(fruit));",
        tags: ["basics", "arrays"],
        start_offset: 381,
        end_offset: 500
    },
    {
        source_id: "javascript-basics",
        chunk_id: "javascript-basics::5",
        text: "Objects: const person = { name: 'John', age: 25, greet() { return 'Hello, I\\'m ' + this.name; } };",
        tags: ["basics", "objects"],
        start_offset: 501,
        end_offset: 600
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

async function insertContent() {
    try {
        console.log('Inserting JavaScript content into database...');
        
        // Clear existing content first
        await query('DELETE FROM doc_chunks WHERE source_id = $1', ['javascript-basics']);
        console.log('✅ Cleared existing content');
        
        // Insert new content
        for (const content of javascriptContent) {
            const embedding = createVector();
            const embStr = `[${embedding.join(',')}]`;
            
            await query(`
                INSERT INTO doc_chunks (source_id, chunk_id, text, tags, start_offset, end_offset, embedding)
                VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
            `, [content.source_id, content.chunk_id, content.text, content.tags, content.start_offset, content.end_offset, embStr]);
            
            console.log(`✅ Inserted: ${content.chunk_id}`);
        }
        
        console.log('🎉 All content inserted successfully!');
        
    } catch (error) {
        console.error('❌ Error inserting content:', error.message);
    } finally {
        process.exit(0);
    }
}

insertContent();
