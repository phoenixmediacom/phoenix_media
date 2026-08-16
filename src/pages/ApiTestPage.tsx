import { useEffect, useState } from "react";
import axios from "axios";

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    async function testAPI() {
      const tests: any = {
        apiUrl: API_URL,
        timestamp: new Date().toISOString(),
      };

      try {
        // 1. Test root
        console.log("Testing:", `${API_URL.replace('/api', '')}/api`);
        const rootRes = await axios.get(`${API_URL.replace('/api', '')}/api`);
        tests.root = { status: "✅ Success", data: rootRes.data };
      } catch (error: any) {
        tests.root = { status: "❌ Failed", error: error.message };
      }

      try {
        // 2. Test health
        const healthRes = await axios.get(`${API_URL.replace('/api', '')}/api/health`);
        tests.health = { status: "✅ Success", data: healthRes.data };
      } catch (error: any) {
        tests.health = { status: "❌ Failed", error: error.message };
      }

      try {
        // 3. Test DB
        const dbRes = await axios.get(`${API_URL.replace('/api', '')}/api/db-test`);
        tests.database = { status: "✅ Success", data: dbRes.data };
      } catch (error: any) {
        tests.database = { status: "❌ Failed", error: error.message };
      }

      try {
        // 4. Test SEO
        const seoRes = await axios.get(`${API_URL}/public/seo`);
        tests.seo = { status: "✅ Success", data: seoRes.data };
      } catch (error: any) {
        tests.seo = { status: "❌ Failed", error: error.message };
      }

      setResults(tests);
      setLoading(false);
    }

    testAPI();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff" }}>
        <h1>⏳ Testing API Connection...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", backgroundColor: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ color: "#FF8A2E", marginBottom: 20 }}>🧪 API Connection Test</h1>

      <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#1a1a1a", borderRadius: 8 }}>
        <h2>🔗 Configuration:</h2>
        <table style={{ width: "100%", marginTop: 10 }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>API URL:</td>
              <td style={{ color: "#4ade80" }}>{results.apiUrl}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Test Time:</td>
              <td>{results.timestamp}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Environment:</td>
              <td>{import.meta.env.MODE}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {Object.entries(results).filter(([key]) => !['apiUrl', 'timestamp'].includes(key)).map(([key, value]: [string, any]) => (
        <div key={key} style={{ marginBottom: 30, padding: 20, backgroundColor: "#1a1a1a", borderRadius: 8 }}>
          <h2 style={{ marginBottom: 15 }}>
            {value.status === "✅ Success" ? "✅" : "❌"} {key.toUpperCase()}
          </h2>
          <div style={{ fontSize: 14, color: value.status === "✅ Success" ? "#4ade80" : "#ef4444", marginBottom: 10 }}>
            {value.status}
          </div>
          <pre style={{ 
            backgroundColor: "#0a0a0a", 
            padding: 15, 
            borderRadius: 5, 
            overflow: "auto",
            maxHeight: 400,
            fontSize: 12,
          }}>
            {JSON.stringify(value.data || value.error, null, 2)}
          </pre>
        </div>
      ))}

      <div style={{ marginTop: 40, padding: 20, backgroundColor: results.root?.status === "✅ Success" ? "#1a5a1a" : "#5a1a1a", borderRadius: 8 }}>
        <h3>📊 Summary:</h3>
        <ul style={{ marginTop: 10, lineHeight: 2 }}>
          <li>{results.root?.status === "✅ Success" ? "✅" : "❌"} API Endpoint</li>
          <li>{results.health?.status === "✅ Success" ? "✅" : "❌"} Health Check</li>
          <li>{results.database?.status === "✅ Success" ? "✅" : "❌"} Database Connection</li>
          <li>{results.seo?.status === "✅ Success" ? "✅" : "❌"} Public Data (SEO)</li>
        </ul>
      </div>
    </div>
  );
}