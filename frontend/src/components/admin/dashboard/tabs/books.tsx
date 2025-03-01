import React from "react";
import { format } from "date-fns";
import { useApi } from "@/context/api";
import {
  Table,
  TableBody,
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  getSortedRowModel,
} from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner"
import { components } from "@/types/shared-types"
import TableLoading from "./table-loading";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogDescription } from "@radix-ui/react-dialog";

type Book = components["schemas"]["go-playground_internal_database_models.Book"];
type Author = components["schemas"]["go-playground_internal_database_models.Author"];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  published_date: z.date({
    required_error: "Published date is required",
  }),
  digital_only: z.boolean().default(false),
  pages: z.coerce.number().min(1, "Pages is required"),
  description: z.string().min(1, "Description is required"),
  isbn: z.string().min(1, "ISBN is required"),
  price: z.coerce.number().min(0.01, "Price is required"),
  author_id: z.number().min(1, "Author is required"),
});

const BooksTab: React.FC = () => {
  const { api, tanClient } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      published_date: new Date(), // Initialize with current date
      digital_only: false,
      pages: 0,
      description: "",
      isbn: "",
      price: 0,
      author_id: undefined, // Leave undefined to trigger the validation
    },
  });

  const {
    data: books = [],
    isLoading,
    isError,
  } = api.useQuery('get', "/admin/books");

  const {
    data: authors = [],
  } = api.useQuery('get', "/admin/authors");

  const createBookMutation = api.useMutation('post', "/admin/books", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/books"] });
      setIsCreateDialogOpen(false);
      const formData = form.getValues();
      toast("Book created", {
        description: `${formData.title} has been added successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to create book. Please try again.",
      });
    }
  });

  const deleteBookMutation = api.useMutation('delete', "/admin/books/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/books"] });
      setIsDeleteDialogOpen(false);
      toast("Book deleted", {
        description: `${selectedBook?.title} has been removed successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to delete book. Please try again.",
      });
    }
  });

  const updateBookMutation = api.useMutation('patch', "/admin/books/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/books"] });
      setIsEditDialogOpen(false);
      const formData = form.getValues();
      toast("Book updated", {
        description: `${formData.title} has been updated successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to update book. Please try again.",
      });
    }
  });

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: "ID",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "published_date",
      header: "Published Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("published_date"));
        return date.toLocaleDateString();
      }
    },
    {
      accessorKey: "pages",
      header: "Pages",
    },
    {
      accessorKey: "digital_only",
      header: "Digital Only",
      cell: ({ row }) => {
        return row.getValue("digital_only") ? "Yes" : "No";
      }
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        return `$${row.getValue("price")}`;
      }
    },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("CreatedAt"));
        return date.toLocaleDateString();
      }
    },
    {
      accessorKey: "UpdatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("UpdatedAt"));
        return date.toLocaleDateString();
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const book = row.original;
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
                  setSelectedBook(book);
                  form.reset();
                  form.setValue("title", book.title);
                  form.setValue("published_date", new Date(book.published_date));
                  form.setValue("digital_only", book.digital_only);
                  form.setValue("pages", book.pages);
                  form.setValue("description", book.description);
                  form.setValue("isbn", book.isbn);
                  form.setValue("price", book.price);
                  form.setValue("author_id", book.AuthorID || 0);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBook(book);
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
    data: books,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handleCreate = (values: z.infer<typeof formSchema>) => {
    // Ensure the date is properly handled
    createBookMutation.mutate({
      body: {
        ...values,
        published_date: values.published_date.toISOString(),
      },
    });
  };

  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    if (!selectedBook?.ID) return;
    updateBookMutation.mutate({
      params: {
        path: { id: selectedBook.ID },
      },
      body: {
        ...values,
        published_date: values.published_date.toISOString(),
      },
    });
  };

  const handleDelete = () => {
    if (selectedBook?.ID) {
      deleteBookMutation.mutate({
        params: {
          path: { id: selectedBook.ID }
        }
      });
    }
  };

  if (isLoading) {
    return <TableLoading title="Book" columnCount={8} hasActions/>
  }

  if (isError) {
    return <div>Error loading books</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Books</h2>
        <Button onClick={() => {
          form.reset();
          setIsCreateDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Book
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
                  No books found.
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Please fill in the details to create a new book.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="grid gap-4 py-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="published_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Published date</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                       Select the date the book was published 
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="digital_only" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Digital Only</FormLabel>
                    <FormDescription>
                      Check if this book is only available digitally
                    </FormDescription>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="pages" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" value={field.value || ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isbn" render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" value={field.value || ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="author_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="">Select an author</option>
                      {authors.map((author: Author) => (
                        <option
                          key={author.ID}
                          value={author.ID}
                        >
                          {author.first_name} {author.last_name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Please update the details to edit the book.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="grid gap-4 py-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="published_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Published date</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                       Select the date the book was published 
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="digital_only" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Digital Only</FormLabel>
                    <FormDescription>
                      Check if this book is only available digitally
                    </FormDescription>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="pages" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" value={field.value || ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isbn" render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" value={field.value || ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="author_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="">Select an author</option>
                      {authors.map((author: Author) => (
                        <option
                          key={author.ID}
                          value={author.ID}
                        >
                          {author.first_name} {author.last_name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book "{selectedBook?.title}".
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

export default BooksTab;