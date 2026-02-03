import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, ShoppingBag } from 'lucide-react';

export function Skills() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Skills Library</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/marketplace">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Marketplace
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/skill-editor">
              <BookOpen className="mr-2 h-4 w-4" />
              Skill Editor
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installed skills</CardTitle>
          <CardDescription>Enable/disable and manage local skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No skills installed. Browse the registry below.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registry browser</CardTitle>
          <CardDescription>Browse and install skills from the registry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search skills..." className="pl-9" />
          </div>
          <p className="text-sm text-muted-foreground">No results. (Registry integration placeholder.)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill detail</CardTitle>
          <CardDescription>SKILL.md render, frontmatter, permissions, provenance. Install flow: gating checks, env prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a skill to view details.</p>
        </CardContent>
      </Card>
    </div>
  );
}
