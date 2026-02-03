import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, FolderOpen } from 'lucide-react';

export function SkillEditor() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Skill Editor</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FolderOpen className="mr-1 h-4 w-4" />
            Open
          </Button>
          <Button variant="outline" size="sm">
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button size="sm">
            <Play className="mr-1 h-4 w-4" />
            Test run
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">File explorer</CardTitle>
            <CardDescription>Local skill folder.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No folder open.</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">SKILL.md editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="frontmatter">Frontmatter</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <textarea
                    className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="# Skill name\n\nDescription..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardContent className="pt-6 prose prose-invert max-w-none">
                  <p className="text-muted-foreground">Preview will render SKILL.md here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="frontmatter" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Frontmatter form (permissions, env, etc.)</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test runner</CardTitle>
              <CardDescription>Run skill and view logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded bg-muted p-4 text-xs text-muted-foreground">No logs.</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
