function ProfileCard(props) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "8px",
      width: "200px",
      margin: "10px"
    }}>
      <img 
        src={props.photo} 
        alt={props.name} 
        style={{ width: "100%", borderRadius: "8px" }} 
      />
      <h2>{props.name}</h2>
      <p>Email: {props.email}</p>
    </div>
  );
}

export default ProfileCard;
