"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Eye,
  MoreHorizontal,
  Trash2,
  Mail,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { StudentProfile } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Department", "Year", "Status"],
      ...students.map((s) => [
        `${s.first_name} ${s.last_name}`,
        s.user_id,
        s.department,
        String(s.graduation_year),
        "Active",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} students?`)) return;

    try {
      const { error } = await supabase
        .from("student_profiles")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      setStudents(students.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      toast.success("Students deleted successfully");
    } catch (error) {
      toast.error("Failed to delete students");
    }
  };

  const columns: Column<StudentProfile>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.avatar_url || ""} />
            <AvatarFallback className="text-xs">
              {student.first_name[0]}
              {student.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {student.first_name} {student.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {student.enrollment_number}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (student) => (
        <span className="text-sm">{student.department}</span>
      ),
    },
    {
      key: "graduation_year",
      label: "Year",
      sortable: true,
      render: (student) => (
        <span className="text-sm">{student.graduation_year}</span>
      ),
    },
    {
      key: "skills",
      label: "Skills",
      render: (student) => (
        <div className="flex flex-wrap gap-1">
          {(student.skills || []).slice(0, 2).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(student.skills || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(student.skills || []).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => <Badge variant="success">Active</Badge>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all registered students
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              searchPlaceholder="Search students..."
              pageSize={10}
              emptyMessage="No students found"
              onRowClick={(student) => setSelectedStudent(student)}
              actions={(student) => (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedStudent(student)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedStudent}
        onOpenChange={() => setSelectedStudent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {selectedStudent.first_name[0]}
                    {selectedStudent.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedStudent.enrollment_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="text-sm">{selectedStudent.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Graduation Year
                  </p>
                  <p className="text-sm">{selectedStudent.graduation_year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm">
                    {selectedStudent.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>

              {selectedStudent.about && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    About
                  </p>
                  <p className="text-sm">{selectedStudent.about}</p>
                </div>
              )}

              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
