import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getStatusBadge } from "./components";
import { dashboardLoader } from "./loaders";
import { Link, useLoaderData } from "react-router";

type ApplicationsTableProps = {
    applications: ReturnType<typeof useLoaderData<typeof dashboardLoader>>['applications'];
};

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
    if ("error" in applications) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p className="font-medium text-red-500">Could not load applications</p>
                {applications.error && <p className="text-sm text-red-500 mt-1">Error: {applications.error}</p>}
            </div>
        );
    }
    if (applications.data && applications.data.length > 0) {
        return (
            <Table>
                <TableCaption>A list of recent applications.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Matriculation No.</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">View</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.data.map(({ application, application_hash }) => (
                        <TableRow key={application._id}>
                            <TableCell>{`${application.surname} ${application.firstname}`}</TableCell>
                            <TableCell>{application.email}</TableCell>
                            <TableCell>{application.matriculation_number}</TableCell>
                            <TableCell>{application.department}</TableCell>
                            <TableCell>{getStatusBadge(application_hash.status)}</TableCell>
                            <TableCell>{new Date(application_hash.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant={"link"} asChild>
                                    <Link to={`/dashboard/applications/${application._id}`}>View details</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    return (
        <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No recent applications to display.</p>
            <p className="text-sm">Check back later for updates.</p>
        </div>
    );
}
