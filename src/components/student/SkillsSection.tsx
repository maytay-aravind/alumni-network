'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SKILLS, SKILL_LEVELS } from '@/lib/constants';
import { X, Plus, Search } from 'lucide-react';

interface SkillItem {
  name: string;
  level: string;
}

interface SkillsSectionProps {
  skills: SkillItem[];
  onUpdate: (skills: SkillItem[]) => void;
}

export function SkillsSection({ skills, onUpdate }: SkillsSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState('Intermediate');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredSkills = SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !skills.some((s) => s.name === skill)
  );

  const addSkill = (skillName: string) => {
    if (!skills.some((s) => s.name === skillName)) {
      onUpdate([...skills, { name: skillName, level: selectedLevel }]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const removeSkill = (skillName: string) => {
    onUpdate(skills.filter((s) => s.name !== skillName));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Advanced':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill.name}
              variant="outline"
              className={cn('flex items-center gap-1 py-1 px-2', getLevelColor(skill.level))}
            >
              {skill.name}
              <span className="text-[10px] opacity-70">({skill.level})</span>
              <button
                onClick={() => removeSkill(skill.name)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="pl-10"
            />
            {showDropdown && filteredSkills.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                {filteredSkills.slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
