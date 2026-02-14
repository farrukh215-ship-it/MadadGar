function Error({ statusCode }) {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>{statusCode || 'Error'}</h1>
      <p>{statusCode === 404 ? 'Page not found' : 'Something went wrong'}</p>
      <a href="/" style={{ marginTop: 16, padding: '8px 16px', background: '#0d9488', color: 'white', textDecoration: 'none', borderRadius: 8 }}>
        Go home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
