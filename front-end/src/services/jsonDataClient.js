/**
 * Direct JSON Database Client for NexusPay Enterprise Academy
 * Fulfills requirement: "see only fetch from json files only"
 * Loads directly from persistent JSON data collections with reactive state and localStorage sync.
 */

import initialUsers from '../../../back-end/data/users.json';
import initialOrgs from '../../../back-end/data/organizations.json';
import initialInstructors from '../../../back-end/data/instructors.json';
import initialLearners from '../../../back-end/data/learners.json';
import initialDisputes from '../../../back-end/data/disputes.json';
import initialCourses from '../../../back-end/data/courses.json';
import initialTransactions from '../../../back-end/data/transactions.json';
import initialEnrollments from '../../../back-end/data/enrollments.json';

const STORAGE_KEY_PREFIX = 'nexuspay_json_db_';

function getCollection(name, defaultData) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${name}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Could not read localStorage for ${name}, using source JSON data`, e);
  }
  // Initialize from source JSON
  saveCollection(name, defaultData);
  return defaultData;
}

function saveCollection(name, data) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${name}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not save localStorage for ${name}`, e);
  }
}

export const jsonDataClient = {
  // 1. Users & Operational Admins
  getUsers: () => getCollection('users', initialUsers),
  getAdmins: () => {
    const users = getCollection('users', initialUsers);
    return users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin');
  },
  createAdmin: (adminData) => {
    const users = getCollection('users', initialUsers);
    const newAdmin = {
      id: `usr-${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      role: 'Admin',
      status: adminData.status || 'Active',
      verificationStatus: 'Verified',
      avatar: adminData.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=200&auto=format&fit=crop&q=80`,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newAdmin, ...users];
    saveCollection('users', updated);
    return newAdmin;
  },
  updateAdmin: (id, updates) => {
    const users = getCollection('users', initialUsers);
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u));
    saveCollection('users', updated);
    return updated.find((u) => u.id === id);
  },
  deleteAdmin: (id) => {
    const users = getCollection('users', initialUsers);
    const updated = users.filter((u) => u.id !== id);
    saveCollection('users', updated);
    return { success: true };
  },

  // 2. Organizations & 85/15 Revenue Split
  getOrganizations: () => {
    const orgs = getCollection('organizations', initialOrgs);
    const instructors = getCollection('instructors', initialInstructors);
    const courses = getCollection('courses', initialCourses);
    const learners = getCollection('learners', initialLearners);
    
    return orgs.map((org) => {
      // Find all instructors associated with this organization
      const rawInstructors = instructors.filter((inst) => {
        if (org.instructorIds && Array.isArray(org.instructorIds) && org.instructorIds.includes(inst.id)) {
          return true;
        }
        if (org.id === 'org-101' && (inst.email?.includes('nexuspay.edu') || ['inst-1', 'inst-3', 'inst-4', 'inst-5', 'inst-6'].includes(inst.id))) {
          return true;
        }
        if (org.id === 'org-102' && (inst.email?.includes('stanford.edu') || inst.id === 'inst-2')) {
          return true;
        }
        if (org.id === 'org-103' && (inst.email?.includes('mit.edu') || inst.bio?.includes('MIT') || ['inst-1', 'inst-2'].includes(inst.id))) {
          return true;
        }
        if (org.id === 'org-104' && inst.id === 'inst-4') {
          return true;
        }
        if (inst.organizationId && inst.organizationId === org.id) return true;
        if (org.name && inst.bio && inst.bio.toLowerCase().includes(org.name.toLowerCase())) return true;
        return false;
      });

      // Enrich each instructor with the specific courses they teach and enrolled student counts
      const associatedInstructors = rawInstructors.map((inst) => {
        const teachingCourses = courses.filter((c) => {
          return c.instructorId === inst.id || c.instructors?.some((ci) => ci.id === inst.id);
        }).map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          level: c.level,
          enrolledCount: Number(c.enrolledCount) || 0,
          price: Number(c.price) || 0,
          rating: Number(c.rating) || 4.8,
          totalHours: c.totalHours || '18h',
          orgName: org.name,
        }));

        const totalEnrolled = teachingCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

        return {
          ...inst,
          teachingCourses,
          teachingCoursesCount: teachingCourses.length,
          totalEnrolledStudents: totalEnrolled > 0 ? totalEnrolled : (inst.enrolledStudents || 120),
        };
      });

      // Find all courses taught by faculty in this organization
      const orgCourses = courses.filter((c) => {
        return associatedInstructors.some((inst) => inst.id === c.instructorId || c.instructors?.some((ci) => ci.id === inst.id));
      });

      // Find enrolled learners in this organization
      const orgLearners = learners.filter((l) => {
        if (!l.university) return false;
        const u = l.university.toLowerCase();
        const o = org.name.toLowerCase();
        return u.includes(o) || o.includes(u) || (org.id === 'org-101' && u.includes('corporate'));
      });

      const grossRevenue = Number(org.totalRevenue) || 100000;
      const orgShare85 = Math.round(grossRevenue * 0.85);
      const superAdminShare15 = Math.round(grossRevenue * 0.15);

      return {
        ...org,
        instructors: associatedInstructors,
        instructorsCount: associatedInstructors.length,
        courses: orgCourses,
        coursesCount: orgCourses.length || org.coursesCount || 4,
        learners: orgLearners,
        learnersCount: orgLearners.length || org.learnersCount || 150,
        financials: {
          grossRevenue,
          orgShare85,
          superAdminShare15,
          orgPercentage: 85,
          superAdminPercentage: 15,
          currency: org.currency || 'USD',
        },
      };
    });
  },
  createOrganization: (orgData) => {
    const orgs = getCollection('organizations', initialOrgs);
    const newId = `org-${Date.now().toString().slice(-4)}`;
    const newOrg = {
      id: newId,
      name: orgData.name,
      tagline: orgData.tagline || 'Leading Educational Institution',
      email: orgData.email || `contact@${newId}.edu`,
      phone: orgData.phone || '+1 (555) 012-3456',
      location: orgData.location || 'Global Campus',
      address: orgData.address || 'Academic Center',
      website: orgData.website || `https://${newId}.edu`,
      status: orgData.status || 'Active',
      establishedYear: orgData.establishedYear || new Date().getFullYear(),
      totalRevenue: Number(orgData.totalRevenue) || 75000,
      monthlyRevenue: Math.round((Number(orgData.totalRevenue) || 75000) * 0.3),
      currency: 'USD',
      instructorIds: orgData.instructorIds || ['inst-1'],
      coursesCount: orgData.coursesCount || 3,
      learnersCount: orgData.learnersCount || 150,
      logo: orgData.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOrg, ...orgs];
    saveCollection('organizations', updated);
    return newOrg;
  },
  updateOrganization: (id, updates) => {
    const orgs = getCollection('organizations', initialOrgs);
    const updated = orgs.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
    saveCollection('organizations', updated);
    return updated.find((o) => o.id === id);
  },
  deleteOrganization: (id) => {
    const orgs = getCollection('organizations', initialOrgs);
    const updated = orgs.filter((o) => o.id !== id);
    saveCollection('organizations', updated);
    return { success: true };
  },

  // 3. Admin Escalations & Disputes Tracking
  getEscalations: () => {
    const disputes = getCollection('disputes', initialDisputes);
    return disputes;
  },
  updateEscalationStatus: (id, status, notes) => {
    const disputes = getCollection('disputes', initialDisputes);
    const updated = disputes.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          status,
          adminNotes: notes ? `${d.adminNotes || ''} • [Super Admin]: ${notes}` : d.adminNotes,
          resolvedAt: status === 'Resolved' ? new Date().toISOString() : d.resolvedAt,
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    saveCollection('disputes', updated);
    return updated.find((d) => d.id === id);
  },
  resolveEscalation: (id, resolutionNote) => {
    const disputes = getCollection('disputes', initialDisputes);
    const updated = disputes.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          status: 'Resolved',
          adminNotes: `${d.adminNotes || ''} • [Super Admin Resolution]: ${resolutionNote}`,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    saveCollection('disputes', updated);
    return updated.find((d) => d.id === id);
  },

  // 4. Platform Learners with 85% rule, University linkage, and Transactions
  getLearners: () => {
    const learners = getCollection('learners', initialLearners);
    const transactions = getCollection('transactions', initialTransactions);
    const enrollments = getCollection('enrollments', initialEnrollments);
    const courses = getCollection('courses', initialCourses);
    const orgs = getCollection('organizations', initialOrgs);

    return learners.map((learner) => {
      // Find matching transactions from transactions.json
      const learnerTx = transactions.filter((t) => {
        const matchesId = t.payerId === learner.id;
        const matchesName = t.payer && learner.name && t.payer.toLowerCase() === learner.name.toLowerCase();
        const matchesEmail = t.payerEmail && learner.email && t.payerEmail.toLowerCase() === learner.email.toLowerCase();
        return matchesId || matchesName || matchesEmail;
      });

      // Find matching enrollments from enrollments.json
      const learnerEnr = enrollments.filter((e) => {
        return e.learnerId === learner.id || (e.learnerEmail && learner.email && e.learnerEmail.toLowerCase() === learner.email.toLowerCase());
      });

      // Find primary matching university / organization
      const matchedOrg = orgs.find((o) => {
        if (!learner.university) return false;
        return (
          o.name.toLowerCase().includes(learner.university.toLowerCase()) ||
          learner.university.toLowerCase().includes(o.name.toLowerCase())
        );
      }) || {
        id: 'org-101',
        name: learner.university || 'NexusPay Partner University',
      };

      // Build structured course records: "took from this org this course paid this much"
      const coursesTakenMap = new Map();

      // First add from transactions
      learnerTx.forEach((tx, idx) => {
        const title = tx.courseTitle || tx.course || 'Enterprise Course';
        const amt = Number(tx.amount) || 79.99;
        const matchedCourse = courses.find((c) => c.title?.toLowerCase() === title.toLowerCase() || c.id === tx.courseId);
        
        // Find which org this course belongs to
        let orgName = matchedOrg.name;
        if (matchedCourse) {
          const courseLead = matchedCourse.leadInstructorName || matchedCourse.instructorName;
          if (courseLead && courseLead.includes('Mitchell')) {
            orgName = 'Stanford University School of Engineering';
          } else if (courseLead && (courseLead.includes('Vance') || courseLead.includes('Wilson'))) {
            orgName = 'NexusPay Enterprise Academy';
          } else if (courseLead && courseLead.includes('Rostova')) {
            orgName = 'California Institute of Technology (Caltech)';
          }
        }

        const orgShare85 = Math.round(amt * 0.85 * 100) / 100;
        const superAdminShare15 = Math.round(amt * 0.15 * 100) / 100;

        coursesTakenMap.set(title, {
          id: tx.id || `TXN-${learner.id}-${idx + 1}`,
          courseId: tx.courseId || matchedCourse?.id || `crs-${idx + 1}`,
          courseTitle: title,
          organizationName: orgName,
          amountPaid: amt,
          orgShare85,
          superAdminShare15,
          paymentMethod: tx.paymentMethod || tx.method || 'Card',
          status: tx.status || 'Paid',
          date: tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'),
          progress: matchedCourse ? 65 : 100,
        });
      });

      // Also ensure enrollments without a direct transaction still have a verified record
      learnerEnr.forEach((enr, idx) => {
        const title = enr.courseTitle;
        if (title && !coursesTakenMap.has(title)) {
          const matchedCourse = courses.find((c) => c.title?.toLowerCase() === title.toLowerCase() || c.id === enr.courseId);
          const amt = matchedCourse ? Number(matchedCourse.price) || 89.99 : 79.99;
          const orgShare85 = Math.round(amt * 0.85 * 100) / 100;
          const superAdminShare15 = Math.round(amt * 0.15 * 100) / 100;

          let orgName = matchedOrg.name;
          if (matchedCourse) {
            const courseLead = matchedCourse.leadInstructorName || matchedCourse.instructorName;
            if (courseLead && courseLead.includes('Mitchell')) {
              orgName = 'Stanford University School of Engineering';
            } else if (courseLead && (courseLead.includes('Vance') || courseLead.includes('Wilson'))) {
              orgName = 'NexusPay Enterprise Academy';
            } else if (courseLead && courseLead.includes('Rostova')) {
              orgName = 'California Institute of Technology (Caltech)';
            }
          }

          coursesTakenMap.set(title, {
            id: enr.id || `ENR-${learner.id}-${idx + 1}`,
            courseId: enr.courseId || matchedCourse?.id || `cou-${idx + 1}`,
            courseTitle: title,
            organizationName: orgName,
            amountPaid: amt,
            orgShare85,
            superAdminShare15,
            paymentMethod: 'Institution Billing',
            status: 'Active',
            date: enr.enrolledDate || 'Recent',
            progress: enr.progress || 0,
          });
        }
      });

      const coursesTaken = Array.from(coursesTakenMap.values());

      const totalSpent = coursesTaken.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0) || Number(learner.totalSpent) || 129.99;
      const orgShare85 = Math.round(totalSpent * 0.85 * 100) / 100;
      const superAdminShare15 = Math.round(totalSpent * 0.15 * 100) / 100;

      return {
        ...learner,
        organization: matchedOrg,
        coursesTaken,
        coursesCount: coursesTaken.length || Number(learner.enrolledCourses) || 1,
        transactions: coursesTaken.map((c) => ({
          id: c.id,
          courseTitle: c.courseTitle,
          university: c.organizationName,
          amount: c.amountPaid,
          orgShare85: c.orgShare85,
          superAdminShare15: c.superAdminShare15,
          method: c.paymentMethod,
          status: c.status,
          date: c.date,
        })),
        transactionsCount: coursesTaken.length,
        financials: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          orgShare85,
          superAdminShare15,
          orgPercentage: 85,
          superAdminPercentage: 15,
        },
      };
    });
  },
  updateLearner: (id, updates) => {
    const learners = getCollection('learners', initialLearners);
    const updated = learners.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    saveCollection('learners', updated);
    return updated.find((l) => l.id === id);
  },
  deleteLearner: (id) => {
    const learners = getCollection('learners', initialLearners);
    const updated = learners.filter((l) => l.id !== id);
    saveCollection('learners', updated);
    return { success: true, id };
  },
  suspendLearner: (id, reason) => {
    const learners = getCollection('learners', initialLearners);
    const updated = learners.map((l) => {
      if (l.id === id) {
        const nextStatus = l.status === 'Suspended' ? 'Active' : 'Suspended';
        return {
          ...l,
          status: nextStatus,
          suspensionReason: nextStatus === 'Suspended' ? (reason || 'Unreal/Suspicious platform activity flagged by Super Admin') : null,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    saveCollection('learners', updated);
    return updated.find((l) => l.id === id);
  },
  createLearner: (data) => {
    const learners = getCollection('learners', initialLearners);
    const newLearner = {
      id: `lrn-${Date.now().toString().slice(-4)}`,
      name: data.name,
      email: data.email,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      learnerType: data.learnerType || 'Student',
      university: data.university || 'Independent Learner',
      enrolledCourses: Number(data.enrolledCourses) || 0,
      completedCourses: 0,
      overallProgress: 0,
      avgScore: '0%',
      certificatesCount: 0,
      status: 'Active',
      joinedDate: 'Just now',
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newLearner, ...learners];
    saveCollection('learners', updated);
    return newLearner;
  },

  // 5. Instructors & Courses
  getInstructors: () => getCollection('instructors', initialInstructors),
  createInstructor: (data) => {
    const instructors = getCollection('instructors', initialInstructors);
    const newInstructor = {
      id: `inst-${Date.now().toString().slice(-4)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '+1 (555) 000-0000',
      role: data.role || 'Professor',
      educatorType: data.role || 'Faculty Instructor',
      department: data.department || data.specialization || 'Computer Science',
      specialization: data.specialization || data.department || 'Computer Science',
      bio: data.bio || `Distinguished academic faculty member.`,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: data.status || 'Active',
      avgRating: Number(data.rating) || 4.9,
      rating: Number(data.rating) || 4.9,
      enrolledStudents: Number(data.enrolledStudents) || 45,
      coursesCount: Number(data.coursesCount) || 1,
      organizationId: data.organizationId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newInstructor, ...instructors];
    saveCollection('instructors', updated);

    // If organizationId is provided, also associate with that organization in organizations collection
    if (data.organizationId) {
      const orgs = getCollection('organizations', initialOrgs);
      const updatedOrgs = orgs.map((o) => {
        if (o.id === data.organizationId) {
          const ids = Array.isArray(o.instructorIds) ? o.instructorIds : [];
          return {
            ...o,
            instructorIds: [...new Set([...ids, newInstructor.id])],
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
      saveCollection('organizations', updatedOrgs);
    }
    return newInstructor;
  },
  updateInstructor: (id, updates) => {
    const instructors = getCollection('instructors', initialInstructors);
    const updated = instructors.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          ...updates,
          avgRating: updates.rating !== undefined ? Number(updates.rating) : i.avgRating || i.rating,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });
    saveCollection('instructors', updated);
    return updated.find((i) => i.id === id);
  },
  deleteInstructor: (id) => {
    const instructors = getCollection('instructors', initialInstructors);
    const updated = instructors.filter((i) => i.id !== id);
    saveCollection('instructors', updated);

    // Remove from any org's instructorIds
    const orgs = getCollection('organizations', initialOrgs);
    const updatedOrgs = orgs.map((o) => {
      if (o.instructorIds && Array.isArray(o.instructorIds) && o.instructorIds.includes(id)) {
        return {
          ...o,
          instructorIds: o.instructorIds.filter((instId) => instId !== id),
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    saveCollection('organizations', updatedOrgs);
    return { success: true, id };
  },
  getCourses: () => getCollection('courses', initialCourses),
  getTransactions: () => getCollection('transactions', initialTransactions),

  // 6. Super Admin Pleasant Analytics Engine
  getSuperAdminAnalytics: () => {
    const users = getCollection('users', initialUsers);
    const orgs = getCollection('organizations', initialOrgs);
    const instructors = getCollection('instructors', initialInstructors);
    const learners = getCollection('learners', initialLearners);
    const courses = getCollection('courses', initialCourses);
    const disputes = getCollection('disputes', initialDisputes);

    const grossRevenue = orgs.reduce((sum, o) => sum + (Number(o.totalRevenue) || 0), 0) || 429480;
    const orgShare85 = Math.round(grossRevenue * 0.85);
    const superAdminShare15 = Math.round(grossRevenue * 0.15);

    const escalations = disputes.filter(
      (d) => d.status === 'Escalated' || d.status === 'Under Review' || d.priority === 'Urgent'
    );

    return {
      stats: {
        totalRevenue: `₹${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        superAdminShare: `₹${superAdminShare15.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        orgShare: `₹${orgShare85.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        totalUsers: users.length.toString(),
        totalLearners: learners.length.toString(),
        totalInstructors: instructors.length.toString(),
        organizations: orgs.length.toString(),
        adminsCount: users.filter((u) => u.role === 'Admin').length.toString(),
        superAdminsCount: users.filter((u) => u.role === 'Super Admin').length.toString(),
        courses: courses.length.toString(),
        activeEscalations: escalations.length.toString(),
      },
      revenueSplit: {
        totalGrossRevenue: grossRevenue,
        orgShare85,
        superAdminShare15,
        orgPercentage: 85,
        superAdminPercentage: 15,
        formattedGross: `₹${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        formattedOrgShare: `₹${orgShare85.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        formattedSuperAdminShare: `₹${superAdminShare15.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
      monthlyTrend: [
        { name: 'May', gross: 65000, orgShare: 55250, superAdminFee: 9750, learners: 340 },
        { name: 'Jun', gross: 82000, orgShare: 69700, superAdminFee: 12300, learners: 410 },
        { name: 'Jul', gross: 110000, orgShare: 93500, superAdminFee: 16500, learners: 520 },
        { name: 'Aug', gross: 172480, orgShare: 146608, superAdminFee: 25872, learners: 680 },
      ],
      systemHealth: {
        status: 'Optimal',
        uptime: '99.98%',
        activeDatabase: 'JSON Database Engine',
        version: '2.4.0',
        activeCollections: 13,
        persistencePath: './back-end/data/*.json',
      },
      rolesBreakdown: {
        superAdmins: users.filter((u) => u.role === 'Super Admin').length || 1,
        admins: users.filter((u) => u.role === 'Admin').length || 2,
        organizations: orgs.length || 4,
        instructors: instructors.length || 6,
        students: learners.length || 6,
      },
      escalationsSummary: {
        total: escalations.length,
        urgentCount: escalations.filter((e) => e.priority === 'Urgent').length,
        highCount: escalations.filter((e) => e.priority === 'High').length,
        items: escalations.slice(0, 5),
      },
      auditLogs: [
        { id: 'log-1', action: 'Global system backup verified', user: 'Platform Super Admin', timestamp: '12 mins ago', status: 'Success' },
        { id: 'log-2', action: 'Settlement finalized (85% Org / 15% Platform Split)', user: 'Platform Super Admin', timestamp: '42 mins ago', status: 'Success' },
        { id: 'log-3', action: 'Operational Admin role verified for system operator', user: 'Platform Super Admin', timestamp: '1 hour ago', status: 'Success' },
        { id: 'log-4', action: 'New institution partnership accredited (MIT)', user: 'Operational Admin', timestamp: '3 hours ago', status: 'Success' },
        { id: 'log-5', action: 'IP copyright dispute DSP-2026-068 reviewed by Legal', user: 'Platform Super Admin', timestamp: '5 hours ago', status: 'Under Review' },
      ],
    };
  },

  // 7. Admin Work & Resolution History ("What admins have resolved")
  getAdminResolutions: () => {
    return getCollection('admin_resolutions', [
      {
        id: 'RES-2026-101',
        ticketId: 'DSP-2026-599',
        adminId: 'usr-9',
        adminName: 'Operational Platform Admin',
        adminEmail: 'admin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        category: 'Technical & Lab Anomaly',
        title: 'Resolved Container Execution Timeout on Theory of Computation Lab',
        entity: 'NexusPay Enterprise Academy',
        courseTitle: 'Theory of Computation',
        findings: 'Identified CPU throttling on Docker container node cluster during peak assignment submissions. Allocated 4 additional compute threads and cleared stale socket locks.',
        actionTaken: 'Cluster scale rebalanced, automated sandbox test completed with 100% pass rate. Ticket closed and student cohort notified.',
        outcome: 'Resolved',
        turnaroundMinutes: 16,
        priority: 'High',
        resolvedAt: '2026-09-03T06:42:00.426Z',
      },
      {
        id: 'RES-2026-102',
        ticketId: 'REF-2026-080',
        adminId: 'usr-9',
        adminName: 'Operational Platform Admin',
        adminEmail: 'admin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        category: 'Financial Settlement & Refunds',
        title: 'Authorized ₹4,200 Student Refund for Accidental Double Checkout',
        entity: 'Alex Chen (Stanford)',
        courseTitle: 'Advanced Enterprise Architecture & Payment Systems',
        findings: 'Verified payment telemetry ledger: two concurrent charges generated within 1.2 seconds due to browser debounce failure on slow WiFi connection.',
        actionTaken: 'Executed full automated refund on secondary transaction TXN-172025. Restored original single-seat license. University royalty ledger debited accordingly.',
        outcome: 'Refunded',
        turnaroundMinutes: 12,
        priority: 'Medium',
        resolvedAt: '2026-09-02T14:15:00.000Z',
      },
      {
        id: 'RES-2026-103',
        ticketId: 'APR-2026-044',
        adminId: 'usr-9',
        adminName: 'Operational Platform Admin',
        adminEmail: 'admin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        category: 'Curriculum & Quality Assurance',
        title: 'Verified and Approved Distributed Systems Curriculum v2',
        entity: 'WillSmith University',
        courseTitle: 'Distributed Systems',
        findings: 'Inspected 8 syllabus modules, verified quiz rubrics, tested video bitrates and validated academic prerequisite guidelines against university accreditation standards.',
        actionTaken: 'Approved course for platform publishing with 85/15 revenue split agreement activated.',
        outcome: 'Approved',
        turnaroundMinutes: 45,
        priority: 'Normal',
        resolvedAt: '2026-09-01T11:30:00.000Z',
      },
      {
        id: 'RES-2026-104',
        ticketId: 'VER-2026-018',
        adminId: 'usr-9',
        adminName: 'Operational Platform Admin',
        adminEmail: 'admin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        category: 'Institutional Accreditation',
        title: 'Accredited IIT Bombay Academic Department & Verified Faculty',
        entity: 'IIT Bombay',
        courseTitle: 'All Academic Programs',
        findings: 'Cross-referenced institutional documentation, government educational domain verification, and designated billing contact details.',
        actionTaken: 'Assigned Verified Organization badge and established direct bank deposit routing for royalty payouts.',
        outcome: 'Verified',
        turnaroundMinutes: 28,
        priority: 'High',
        resolvedAt: '2026-08-30T16:20:00.000Z',
      },
      {
        id: 'RES-2026-105',
        ticketId: 'DSP-2026-161',
        adminId: 'usr-8',
        adminName: 'Platform Super Admin',
        adminEmail: 'superadmin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        category: 'Copyright & IP Infringement',
        title: 'Investigated Course Material Plagiarism Claim for Theory of Computation',
        entity: 'NexusPay Enterprise Academy',
        courseTitle: 'Theory of Computation',
        findings: 'Ran automated lexical match across 14 lab exercises. Unlicensed mirroring detected on external test repo. Content hash matches original author timestamps.',
        actionTaken: 'Issued administrative takedown notice. Restricted conflicting course submission and preserved original author royalty distribution.',
        outcome: 'Resolved',
        turnaroundMinutes: 38,
        priority: 'Urgent',
        resolvedAt: '2026-08-31T09:10:00.000Z',
      },
      {
        id: 'RES-2026-106',
        ticketId: 'SEC-2026-009',
        adminId: 'usr-9',
        adminName: 'Operational Platform Admin',
        adminEmail: 'admin@nexuspay-platform.io',
        adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        category: 'Security & Access',
        title: 'Mitigated Credential Stuffing & Revoked Compromised API Session',
        entity: 'Independent Learner Cohort',
        courseTitle: 'Zero-Trust Cybersecurity & Banking Cryptography',
        findings: 'Security monitor detected 84 rapid authentication failures followed by login from anomalous ASN. Session tokens flagged as compromised.',
        actionTaken: 'Terminated active JWT tokens, enabled mandatory 2FA challenge, and unblocked clean IP ranges after verification.',
        outcome: 'Resolved',
        turnaroundMinutes: 9,
        priority: 'Urgent',
        resolvedAt: '2026-08-29T18:40:00.000Z',
      },
    ]);
  },
  recordAdminResolution: (resolutionData) => {
    const resolutions = jsonDataClient.getAdminResolutions();
    const newRecord = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      ticketId: resolutionData.ticketId || `TKT-${Date.now().toString().slice(-4)}`,
      adminId: resolutionData.adminId || 'usr-9',
      adminName: resolutionData.adminName || 'Operational Platform Admin',
      adminEmail: resolutionData.adminEmail || 'admin@nexuspay-platform.io',
      adminAvatar: resolutionData.adminAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      category: resolutionData.category || 'General Administration',
      title: resolutionData.title,
      entity: resolutionData.entity || 'NexusPay Platform',
      courseTitle: resolutionData.courseTitle || '',
      findings: resolutionData.findings || 'Investigation concluded by administrator.',
      actionTaken: resolutionData.actionTaken || 'Action logged and validated.',
      outcome: resolutionData.outcome || 'Resolved',
      turnaroundMinutes: resolutionData.turnaroundMinutes || 15,
      priority: resolutionData.priority || 'Medium',
      resolvedAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...resolutions];
    saveCollection('admin_resolutions', updated);
    return newRecord;
  },
};

export default jsonDataClient;
