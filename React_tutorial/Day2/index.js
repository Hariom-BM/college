const h4=<article className="card" aria-labelledby="card-title">
    <img
        src="https://cdn.optimizely.com/img/22791482274/10e95b4cc46a49a2970f437e211a81c0.svg"
        alt="stars icon"
    />
    <div className="card-content">
        <h2 id="card-title">
            Web Development
        </h2>
        <p>
            Learn HTML, CSS, JavaScript, and accessibility
            best practices for modern websites.
        </p>
        <a href="#" aria-label="Read more about Web Development">
            Read More
        </a>
    </div>

</article>;
const root=ReactDOM.createRoot(document.querySelector('#root'));

root.render(h4);
