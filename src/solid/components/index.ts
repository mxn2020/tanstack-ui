// src/solid/components/index.ts

// Export shared types
export type * from '../lib/types'

// Basic form components
export { Button, type ButtonProps } from './Button'
export { Input } from './Input'
export { Textarea } from './Textarea'
export { Checkbox } from './Checkbox'
export { Switch } from './Switch'
export { RadioGroup, RadioGroupItem } from './RadioGroup'
//export { LinkButton } from '../tanstack-components/LinkButton' // Requires @tanstack/react-router

// Display components
export { Badge, StatusBadge, PriorityBadge } from './Badge'
export { Chip } from './Chip'
export { Loading, LoadingSkeleton } from './Loading'
export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './Tooltip'
export { CostDisplay, SimpleCostDisplay } from './CostDisplay'

// Layout components
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card'
export { Section, SectionHeader, SectionTitle, SectionDescription, SectionContent, CompoundSection } from './Section'
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, DataTable } from './Table'
export { ListItem, ListContainer, DataList, CompactListView } from './List'
export { ViewSwitcher, type ViewMode } from './ViewSwitcher'
export { Separator } from './Separator'
export { Breadcrumb, createProjectBreadcrumbs, type BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb'

// Interactive components
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SimpleSelect } from './Select'
export { Progress } from './Progress'
export { Slider } from './Slider'
export { ToggleGroup, ToggleGroupItem } from './ToggleGroup'

// Compound components with context
export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from './Dialog'

export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel, 
  DropdownMenuCheckboxItem 
} from './DropdownMenu'

export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible'

export { Alert, AlertTitle, AlertDescription, AlertIcon, CompoundAlert } from './Alert'

export { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogAction, 
  AlertDialogCancel 
} from './AlertDialog'

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose
} from './Popover'

// Utility components
export { Avatar, AvatarImage, AvatarFallback, CompoundAvatar, getAvatarInitials } from './Avatar'
export { Label } from './Label'
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonGrid,
  SkeletonForm,
  SkeletonMetricCard,
  SkeletonList
} from './Skeleton'
export { Calendar } from './Calendar'
export { DatePicker } from './DatePicker'
export { DateTimePicker } from './DateTimePicker'
export { CalendarInput } from './CalendarInput'

// Empty state components
export { EmptyState, type EmptyStateProps, type EmptyStateVariant, NoSearchResults, NoFilterResults } from './EmptyState'

// Modal components
export { ScrollArea } from './ScrollArea'


/* Ideas for additional components

export { Pagination } from './Pagination'
export { RichTextEditor } from './RichTextEditor'
export { FileUploader } from './FileUploader'
export { ImageUploader } from './ImageUploader'
export { MarkdownViewer } from './MarkdownViewer'
export { CodeBlock } from './CodeBlock'
export { JsonViewer } from './JsonViewer'
export { TreeView, TreeNode } from './TreeView'
export { Wizard, WizardStep } from './Wizard'
export { ToastProvider, useToast } from './Toast'
export { Banner } from './Banner'
export { HamburgerMenu } from './HamburgerMenu'
export { CopyButton } from './CopyButton'
export { BackButton } from './BackButton'
export { ScrollToTopButton } from './ScrollToTopButton'
export { FloatingButton } from './FloatingButton'
export { ExpandableText } from './ExpandableText'
export { StarRating } from './StarRating'
export { ColorPicker } from './ColorPicker'
export { TimePicker } from './TimePicker'
export { ToggleButton } from './ToggleButton'
export { VideoPlayer } from './VideoPlayer'
export { AudioPlayer } from './AudioPlayer'
export { MapView } from './MapView'
export { QRCode } from './QRCode'
export { Barcode } from './Barcode'

*/
