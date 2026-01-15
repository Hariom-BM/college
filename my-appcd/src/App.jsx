import ProfileCard from "./ProfileCard";

function App() {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <ProfileCard 
        photo="https://via.placeholder.com/200"
        name="Hari Om"
        email="hari@example.com"
      />
      <ProfileCard 
        photo="https://via.placeholder.com/200"
        name="Rahul Kumar"
        email="rahul@example.com"
      />
    </div>
  );
}

export default App;
