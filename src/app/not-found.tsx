export default function NotFound() {
  return (
    <main className="not-found">
      <p className="kicker">Asset not found</p>
      <h1>This link does not point to a stored asset.</h1>
      <p>Check the slug or generate a new asset from the API.</p>
      <a className="button" href="/">Return to generator</a>
    </main>
  );
}
