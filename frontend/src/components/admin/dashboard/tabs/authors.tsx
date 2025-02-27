import React from "react";
import { useApi } from "@/context/api";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  getPaginationRowModel, 
  ColumnDef, 
  SortingState, 
  getSortedRowModel 
} from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner"
import { components } from "@/types/shared-types"

// Define the Author type based on the model
type Author = components["schemas"]["go-playground_internal_server_types.ListAuthorResponse"]

type AuthorFormData = {
  first_name: string;
  last_name: string;
};

const AuthorsTab: React.FC = () => {
  const { api } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedAuthor, setSelectedAuthor] = React.useState<Author | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<AuthorFormData>({
    first_name: "",
    last_name: ""
  });
  
  // Fetch authors data using the API context
  const { 
    data: authors = [], 
    isLoading, 
    isError, 
    refetch 
  } = api.useQuery('get',"/authors", {});

  // Define columns for the table
  const columns: ColumnDef<Author>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString();
      }
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"));
        return date.toLocaleDateString();
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const author = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAuthor(author);
                  setFormData({
                    first_name: author.first_name || "",
                    last_name: author.last_name || ""
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAuthor(author);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: authors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create new author
  const handleCreate = async () => {
    try {
      await api.POST("/authors", {
        body: formData
      });
      refetch();
      setIsCreateDialogOpen(false);
      toast("Author created", {
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to create author. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update existing author
  const handleUpdate = async () => {
    if (!selectedAuthor) return;
    try {
      await api.PUT(`/authors/${selectedAuthor.id}`, {
        body: formData
      });
      refetch();
      setIsEditDialogOpen(false);
      toast("Author updated", {
        description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to update author. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete author
  const handleDelete = async () => {
    if (!selectedAuthor) return;
    try {
      await api.DELETE(`/authors/${selectedAuthor.id}`, {});
      refetch();
      setIsDeleteDialogOpen(false);
      toast("Author deleted", {
        description: `${selectedAuthor.first_name} ${selectedAuthor.last_name} has been removed successfully.`,
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete author. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading authors</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authors</h2>
        <Button onClick={() => {
          setFormData({ first_name: "", last_name: "" });
          setIsCreateDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No authors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Author</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                className="col-span-3"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                className="col-span-3"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Author</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="edit_first_name"
                name="first_name"
                className="col-span-3"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="edit_last_name"
                name="last_name"
                className="col-span-3"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the author {selectedAuthor?.first_name} {selectedAuthor?.last_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AuthorsTab;