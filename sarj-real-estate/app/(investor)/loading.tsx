export default function Loading() {
  return <div className="site-width section" role="status" aria-label="Loading opportunities">
    <div className="skeleton" style={{
      height: 65,
      width: "60%",
      marginBottom: 32
    }} />
    <div className="parcel-grid">
      {[0, 1, 2].map(i => <div className="skeleton" key={i} />)}
    </div>
  </div>;
}
