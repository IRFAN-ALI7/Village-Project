import { useState, useEffect } from "react";
import {
    Award,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    ChevronLeft,
    ChevronRight,
    Search,
    FileText,
    ThumbsUp,
    ThumbsDown,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

export default function CertificatesManagement() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showViewModal, setShowViewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);

    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 8;


    // FETCH CERTIFICATES
    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/admin/all-certificates`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                setCertificates(
                    Array.isArray(data.data) ? data.data : []
                );
            } else {
                toast.error(
                    data.message || "Failed to load certificates"
                );
                setCertificates([]);
            }
        } catch (error) {
            console.error("Fetch certificates error:", error);
            toast.error("Failed to load certificates");
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };


    // FILTER + SEARCH
    const filteredCertificates = certificates.filter((cert) => {
        if (
            filterType !== "all" &&
            cert.type !== filterType
        ) {
            return false;
        }

        if (
            filterStatus !== "all" &&
            cert.status !== filterStatus
        ) {
            return false;
        }

        if (startDate && cert.appliedDate) {
            const appliedDate = new Date(cert.appliedDate);
            const fromDate = new Date(startDate);

            if (appliedDate < fromDate) {
                return false;
            }
        }

        if (endDate && cert.appliedDate) {
            const appliedDate = new Date(cert.appliedDate);

            const toDate = new Date(endDate);
            toDate.setHours(23, 59, 59, 999);

            if (appliedDate > toDate) {
                return false;
            }
        }

        if (searchTerm.trim()) {
            const search = searchTerm
                .toLowerCase()
                .trim();

            const certificateId = String(
                cert.certificateId || ""
            ).toLowerCase();

            const applicantName = String(
                cert.applicantName ||
                cert.userId?.name ||
                ""
            ).toLowerCase();

            if (
                !certificateId.includes(search) &&
                !applicantName.includes(search)
            ) {
                return false;
            }
        }

        return true;
    });


    // PAGINATION
    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredCertificates.length / itemsPerPage
        )
    );

    const startIndex =
        (currentPage - 1) * itemsPerPage;

    const endIndex =
        startIndex + itemsPerPage;

    const currentCertificates =
        filteredCertificates.slice(
            startIndex,
            endIndex
        );


    // STATUS COUNTS
    const statusCounts = {
        total: certificates.length,

        pending: certificates.filter(
            (c) => c.status === "pending"
        ).length,

        approved: certificates.filter(
            (c) => c.status === "approved"
        ).length,

        rejected: certificates.filter(
            (c) => c.status === "rejected"
        ).length,
    };


    // APPROVE
    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/admin/approve/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                toast.success(
                    data.message ||
                    "Certificate approved successfully"
                );

                setShowViewModal(false);
                setSelectedCertificate(null);

                await fetchCertificates();
            } else {
                toast.error(
                    data.message ||
                    "Failed to approve certificate"
                );
            }
        } catch (error) {
            console.error("Approve error:", error);
            toast.error("Failed to approve certificate");
        }
    };


    // OPEN REJECT MODAL
    const handleReject = (id) => {
        const certificate = certificates.find(
            (cert) => cert._id === id
        );

        if (!certificate) {
            toast.error("Certificate not found");
            return;
        }

        setSelectedCertificate(certificate);
        setShowViewModal(false);
        setShowRejectModal(true);
        setRejectionReason("");
    };


    // CONFIRM REJECT
    const confirmReject = async () => {
        if (!selectedCertificate) {
            return;
        }

        if (!rejectionReason.trim()) {
            toast.error(
                "Please provide a reason for rejection"
            );
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/admin/reject/${selectedCertificate._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reason: rejectionReason.trim(),
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                toast.success(
                    data.message ||
                    "Certificate rejected successfully"
                );

                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedCertificate(null);

                await fetchCertificates();
            } else {
                toast.error(
                    data.message ||
                    "Failed to reject certificate"
                );
            }
        } catch (error) {
            console.error("Reject error:", error);
            toast.error("Failed to reject certificate");
        }
    };


    // VIEW DETAILS
    const handleViewDetails = (certificate) => {
        setSelectedCertificate(certificate);
        setShowViewModal(true);
    };


    // SHOW REJECTION REASON
    const handleShowReason = (certificate) => {
        setSelectedCertificate(certificate);
        setShowReasonModal(true);
    };


    // DOWNLOAD
    const handleDownload = async (certificate) => {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${API_URL}/admin/certificates/download/${certificate._id}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            let message = "Download failed";

            try {
                const data = await res.json();
                message = data.message || message;
            } catch {
                // Ignore JSON parsing error
            }

            toast.error(message);
            return;
        }

        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =
            `${certificate.certificateId || "certificate"}.pdf`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);

        toast.success(
            `${certificate.type || "Certificate"} downloaded successfully!`
        );

    } catch (error) {
        console.error("Download error:", error);

        toast.error("Download failed");
    }
};

    // PAGE CHANGE
    const handlePageChange = (page) => {
        if (
            page >= 1 &&
            page <= totalPages
        ) {
            setCurrentPage(page);
        }
    };


    // PAGE NUMBERS
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (
                let i = 1;
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }

            return pages;
        }

        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4);
            pages.push("...");
            pages.push(totalPages);
        } else if (
            currentPage >= totalPages - 2
        ) {
            pages.push(1);
            pages.push("...");

            for (
                let i = totalPages - 3;
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push("...");
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };


    // STATUS BADGE
    const getStatusBadge = (status) => {
        if (status === "pending") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Pending
                </span>
            );
        }

        if (status === "approved") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Approved
                </span>
            );
        }

        if (status === "rejected") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Rejected
                </span>
            );
        }

        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                Unknown
            </span>
        );
    };


    // SAFE DATE
    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "-";
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">

                <div className="mb-6">

                    <h2 className="text-2xl font-bold text-gray-800">
                        Certificate Applications
                    </h2>

                    <p className="text-gray-600 text-sm mt-1">
                        Manage and review certificate requests
                    </p>

                </div>


                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-2xl font-bold text-gray-800">
                                    {statusCounts.total}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Total Applications
                                </p>
                            </div>

                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>

                        </div>
                    </div>


                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-2xl font-bold text-gray-800">
                                    {statusCounts.pending}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Pending
                                </p>
                            </div>

                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>

                        </div>
                    </div>


                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-2xl font-bold text-gray-800">
                                    {statusCounts.approved}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Approved
                                </p>
                            </div>

                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>

                        </div>
                    </div>


                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-2xl font-bold text-gray-800">
                                    {statusCounts.rejected}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Rejected
                                </p>
                            </div>

                            <div className="bg-red-100 p-3 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>

                        </div>
                    </div>

                </div>


                {/* FILTERS */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                                Certificate Type
                            </label>

                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="all">
                                    All Types
                                </option>
                                <option value="Income Certificate">
                                    Income Certificate
                                </option>

                                <option value="Caste Certificate">
                                    Caste Certificate
                                </option>
                                <option value="Residential Certificate">
                                    Residential Certificate
                                </option>
                                <option value="Birth Certificate">
                                    Birth Certificate
                                </option>
                                <option value="Death Certificate">
                                    Death Certificate
                                </option>
                            </select>
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                                Status
                            </label>

                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="all">
                                    All Status
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                                <option value="approved">
                                    Approved
                                </option>

                                <option value="rejected">
                                    Rejected
                                </option>
                            </select>
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                                Search by Name or ID
                            </label>

                            <div className="relative">

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search..."
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm"
                                />

                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                            </div>
                        </div>

                    </div>

                </div>


                {/* TABLE */}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Application ID
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Certificate Type
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Applicant Name
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Applied Date
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-200">

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            Loading certificates...
                                        </td>
                                    </tr>

                                ) : currentCertificates.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            No certificates found.
                                        </td>
                                    </tr>

                                ) : (

                                    currentCertificates.map((cert) => (

                                        <tr
                                            key={cert._id}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                                {cert.certificateId || "-"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-800">
                                                {cert.type || "-"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-800">
                                                {cert.applicantName ||
                                                    cert.userId?.name ||
                                                    "-"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(
                                                    cert.appliedDate
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    cert.status
                                                )}
                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="flex items-center space-x-2">

                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(cert)
                                                        }
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-semibold"
                                                    >
                                                        View
                                                    </button>


                                                    {cert.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        cert._id
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-semibold"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleReject(
                                                                        cert._id
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}


                                                    {cert.status === "approved" && (
                                                        <button
                                                            onClick={() =>
                                                                handleDownload(cert)
                                                            }
                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-semibold flex items-center space-x-1"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            <span>
                                                                Download
                                                            </span>
                                                        </button>
                                                    )}


                                                    {cert.status === "rejected" && (
                                                        <button
                                                            onClick={() =>
                                                                handleShowReason(cert)
                                                            }
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold"
                                                        >
                                                            Reason
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* PAGINATION */}

                    {!loading &&
                        filteredCertificates.length > 0 && (

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                                    <p className="text-sm text-gray-700">
                                        Showing{" "}
                                        <span className="font-semibold">
                                            {startIndex + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold">
                                            {Math.min(
                                                endIndex,
                                                filteredCertificates.length
                                            )}
                                        </span>{" "}
                                        out of{" "}
                                        <span className="font-semibold">
                                            {filteredCertificates.length}
                                        </span>{" "}
                                        results
                                    </p>


                                    <div className="flex items-center space-x-2">

                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg font-semibold bg-white text-gray-700 border border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
                                        >
                                            <ChevronLeft className="h-4 w-4 inline" />
                                            Previous
                                        </button>


                                        <div className="flex items-center space-x-1">

                                            {getPageNumbers().map(
                                                (page, index) => (

                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            typeof page === "number" &&
                                                            handlePageChange(page)
                                                        }
                                                        disabled={
                                                            page === "..."
                                                        }
                                                        className={`min-w-[40px] h-10 rounded-lg font-semibold ${
                                                            page === currentPage
                                                                ? "bg-blue-600 text-white"
                                                                : page === "..."
                                                                ? "bg-transparent text-gray-400"
                                                                : "bg-white text-gray-700 border border-gray-300"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>

                                                )
                                            )}

                                        </div>


                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="px-4 py-2 rounded-lg font-semibold bg-white text-gray-700 border border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 inline" />
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}

                </div>

            </div>


            
            {/* VIEW MODAL */}

            {showViewModal &&
                selectedCertificate && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center space-x-3">

                                        <Award className="h-8 w-8" />

                                        <div>

                                            <h2 className="text-2xl font-bold">
                                                Certificate Application Details
                                            </h2>

                                            <p className="text-white/80 text-sm">
                                                Application ID:{" "}
                                                {selectedCertificate.certificateId}
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowViewModal(false)
                                        }
                                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                </div>

                            </div>


                            <div className="p-6 space-y-6">

                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">

                                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                                        Certificate Information
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Certificate Type
                                            </p>

                                            <p className="font-bold">
                                                {selectedCertificate.type || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Application ID
                                            </p>

                                            <p className="text-blue-600 font-bold">
                                                {selectedCertificate.certificateId || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Status
                                            </p>

                                            {getStatusBadge(
                                                selectedCertificate.status
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Application Date
                                            </p>

                                            <p>
                                                {formatDate(
                                                    selectedCertificate.appliedDate
                                                )}
                                            </p>
                                        </div>

                                        {selectedCertificate.issueDate && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Approved Date
                                                </p>

                                                <p className="text-green-600 font-bold">
                                                    {formatDate(
                                                        selectedCertificate.issueDate
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {selectedCertificate.rejectionReason && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600">
                                                    Rejection Reason
                                                </p>

                                                <p className="text-red-600 font-semibold">
                                                    {selectedCertificate.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                </div>


                                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">

                                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                                        Applied By
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Applicant Name
                                            </p>

                                            <p className="font-bold">
                                                {selectedCertificate.userId?.name ||
                                                    selectedCertificate.applicantName ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Email
                                            </p>

                                            <p>
                                                {selectedCertificate.userId?.email ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Phone
                                            </p>

                                            <p>
                                                {selectedCertificate.userId?.mobile ||
                                                    selectedCertificate.userId?.phoneNumber ||
                                                    selectedCertificate.phoneNumber ||
                                                    "-"}
                                            </p>
                                        </div>

                                    </div>

                                </div>


                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">

                                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Full Name
                                            </p>

                                            <p className="font-bold">
                                                {selectedCertificate.applicantName || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Father's Name
                                            </p>

                                            <p>
                                                {selectedCertificate.fatherName || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Date of Birth
                                            </p>

                                            <p>
                                                {formatDate(
                                                    selectedCertificate.dateOfBirth
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Gender
                                            </p>

                                            <p className="capitalize">
                                                {selectedCertificate.gender || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Phone Number
                                            </p>

                                            <p>
                                                {selectedCertificate.phoneNumber || "-"}
                                            </p>
                                        </div>

                                        <div className="col-span-2">

                                            <p className="text-sm text-gray-600">
                                                Address
                                            </p>

                                            <p>
                                                {selectedCertificate.address || "-"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="flex space-x-3 pt-2">

                                    {selectedCertificate.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleApprove(
                                                        selectedCertificate._id
                                                    )
                                                }
                                                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2"
                                            >
                                                <ThumbsUp className="h-5 w-5" />
                                                <span>
                                                    Approve Certificate
                                                </span>
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleReject(
                                                        selectedCertificate._id
                                                    )
                                                }
                                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center space-x-2"
                                            >
                                                <ThumbsDown className="h-5 w-5" />
                                                <span>
                                                    Reject Certificate
                                                </span>
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() =>
                                            setShowViewModal(false)
                                        }
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


            {/* ========================================== */}
            {/* REJECT MODAL */}
            {/* ========================================== */}

            {showRejectModal &&
                selectedCertificate && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

                            <div className="bg-red-600 text-white p-6 rounded-t-2xl">

                                <div className="flex items-center space-x-3">

                                    <XCircle className="h-8 w-8" />

                                    <h2 className="text-2xl font-bold">
                                        Reject Certificate
                                    </h2>

                                </div>

                            </div>


                            <div className="p-6 space-y-4">

                                <p>
                                    <strong>
                                        Application ID:
                                    </strong>{" "}
                                    {selectedCertificate.certificateId}
                                </p>

                                <p>
                                    <strong>
                                        Applicant:
                                    </strong>{" "}
                                    {selectedCertificate.applicantName ||
                                        selectedCertificate.userId?.name ||
                                        "-"}
                                </p>

                                <p>
                                    <strong>
                                        Type:
                                    </strong>{" "}
                                    {selectedCertificate.type || "-"}
                                </p>


                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reason for Rejection{" "}
                                        <span className="text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) =>
                                            setRejectionReason(
                                                e.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Please provide a clear reason..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                                    />

                                </div>


                                <div className="flex space-x-3">

                                    <button
                                        onClick={confirmReject}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                                    >
                                        Confirm Rejection
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowRejectModal(false);
                                            setRejectionReason("");
                                            setSelectedCertificate(null);
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


            {/* ========================================== */}
            {/* REASON MODAL */}
            {/* ========================================== */}

            {showReasonModal &&
                selectedCertificate && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

                            <div className="bg-red-600 text-white p-6 rounded-t-2xl">

                                <div className="flex items-center justify-between">

                                    <h2 className="text-2xl font-bold">
                                        Rejection Reason
                                    </h2>

                                    <button
                                        onClick={() =>
                                            setShowReasonModal(false)
                                        }
                                        className="bg-white/20 p-2 rounded-full"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                </div>

                            </div>


                            <div className="p-6 space-y-4">

                                <p>
                                    <strong>
                                        Application ID:
                                    </strong>{" "}
                                    {selectedCertificate.certificateId}
                                </p>

                                <p>
                                    <strong>
                                        Applicant:
                                    </strong>{" "}
                                    {selectedCertificate.applicantName ||
                                        selectedCertificate.userId?.name ||
                                        "-"}
                                </p>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">

                                    <p className="font-semibold mb-2">
                                        Reason:
                                    </p>

                                    <p>
                                        {selectedCertificate.rejectionReason ||
                                            "No reason provided"}
                                    </p>

                                </div>


                                <button
                                    onClick={() =>
                                        setShowReasonModal(false)
                                    }
                                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}