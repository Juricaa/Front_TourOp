import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string) => {
    setLoading(true);
    setTestResult("");

    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Response data:`, data);
      setTestResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => testApi("/api/ping")}
            disabled={loading}
            variant="outline"
          >
            Test Ping
          </Button>
          <Button
            onClick={() => testApi("/api/clients")}
            disabled={loading}
            variant="outline"
          >
            Test Clients
          </Button>
          <Button
            onClick={() => testApi("/api/hebergements")}
            disabled={loading}
            variant="outline"
          >
            Test Hébergements
          </Button>
          <Button
            onClick={() => testApi("/api/voitures")}
            disabled={loading}
            variant="outline"
          >
            Test Véhicules
          </Button>
          <Button
            onClick={() => testApi("/api/activites")}
            disabled={loading}
            variant="outline"
          >
            Test Activités
          </Button>
          <Button
            onClick={() => testApi("/api/vols")}
            disabled={loading}
            variant="outline"
          >
            Test Vols
          </Button>
        </div>

        {loading && <div>Testing...</div>}

        {testResult && (
          <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
            {testResult}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
