// Load Firebase compat modules so the existing namespaced API keeps working.
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage-compat.js";

const firebase = window.firebase;

// Firebase Configuration
// Initialize Firebase and set up CRUD operations

const firebaseConfig = {
    apiKey: "AIzaSyAlUpIbQH1k678yqHnhxMiyYJ_NZ3zaeKo",
  authDomain: "prayer-72a4b.firebaseapp.com",
  projectId: "prayer-72a4b",
  storageBucket: "prayer-72a4b.firebasestorage.app",
  messagingSenderId: "629914619936",
  appId: "1:629914619936:web:ebe967ca3da7198982ac45"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ==========================================
// MEMBERS CRUD OPERATIONS
// ==========================================

class MembersService {
    constructor() {
        this.collection = "members";
    }

    // CREATE - Add a new member
    async addMember(memberData) {
        try {
            const docRef = await db.collection(this.collection).add({
                ...memberData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showAlert(`Member added successfully with ID: ${docRef.id}`, 'success');
            return docRef.id;
        } catch (error) {
            showAlert(`Error adding member: ${error.message}`, 'error');
            console.error("Error adding member:", error);
            return null;
        }
    }

    // READ - Get all members
    async getAllMembers() {
        try {
            const snapshot = await db.collection(this.collection).get();
            const members = [];
            snapshot.forEach(doc => {
                members.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return members;
        } catch (error) {
            showAlert(`Error fetching members: ${error.message}`, 'error');
            console.error("Error fetching members:", error);
            return [];
        }
    }

    // READ - Get single member
    async getMemberById(memberId) {
        try {
            const doc = await db.collection(this.collection).doc(memberId).get();
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            } else {
                showAlert("Member not found", 'error');
                return null;
            }
        } catch (error) {
            showAlert(`Error fetching member: ${error.message}`, 'error');
            console.error("Error fetching member:", error);
            return null;
        }
    }

    // UPDATE - Update member data
    async updateMember(memberId, memberData) {
        try {
            await db.collection(this.collection).doc(memberId).update({
                ...memberData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showAlert("Member updated successfully", 'success');
            return true;
        } catch (error) {
            showAlert(`Error updating member: ${error.message}`, 'error');
            console.error("Error updating member:", error);
            return false;
        }
    }

    // DELETE - Remove a member
    async deleteMember(memberId) {
        try {
            await db.collection(this.collection).doc(memberId).delete();
            showAlert("Member deleted successfully", 'success');
            return true;
        } catch (error) {
            showAlert(`Error deleting member: ${error.message}`, 'error');
            console.error("Error deleting member:", error);
            return false;
        }
    }

    // SEARCH - Search members by name or role
    async searchMembers(searchTerm, role = null) {
        try {
            let query = db.collection(this.collection);
            
            if (role) {
                query = query.where("role", "==", role);
            }
            
            const snapshot = await query.get();
            const results = [];
            
            snapshot.forEach(doc => {
                const member = { id: doc.id, ...doc.data() };
                if (searchTerm === "" || 
                    member.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push(member);
                }
            });
            
            return results;
        } catch (error) {
            showAlert(`Error searching members: ${error.message}`, 'error');
            console.error("Error searching members:", error);
            return [];
        }
    }
}

// ==========================================
// ATTENDANCE CRUD OPERATIONS
// ==========================================

class AttendanceService {
    constructor() {
        this.collection = "attendance";
    }

    // CREATE - Record attendance
    async recordAttendance(attendanceData) {
        try {
            // Preserve any user-supplied `date` (the UI uses YYYY-MM-DD strings).
            // Only fall back to a server timestamp if the caller didn't provide one.
            const payload = {
                ...attendanceData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (!attendanceData.date) {
                payload.date = firebase.firestore.FieldValue.serverTimestamp();
            }
            const docRef = await db.collection(this.collection).add(payload);
            showAlert("Attendance recorded successfully", 'success');
            return docRef.id;
        } catch (error) {
            showAlert(`Error recording attendance: ${error.message}`, 'error');
            console.error("Error recording attendance:", error);
            return null;
        }
    }

    // READ - Get all attendance records
    async getAllAttendance() {
        try {
            const snapshot = await db.collection(this.collection)
                .orderBy("date", "desc")
                .get();
            const records = [];
            snapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return records;
        } catch (error) {
            showAlert(`Error fetching attendance: ${error.message}`, 'error');
            console.error("Error fetching attendance:", error);
            return [];
        }
    }

    // READ - Get attendance by member
    async getAttendanceByMember(memberId) {
        try {
            const snapshot = await db.collection(this.collection)
                .where("memberId", "==", memberId)
                .orderBy("date", "desc")
                .get();
            const records = [];
            snapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return records;
        } catch (error) {
            showAlert(`Error fetching member attendance: ${error.message}`, 'error');
            console.error("Error fetching member attendance:", error);
            return [];
        }
    }

    // READ - Get attendance by date
    async getAttendanceByDate(startDate, endDate) {
        try {
            const snapshot = await db.collection(this.collection)
                .where("date", ">=", new Date(startDate))
                .where("date", "<=", new Date(endDate))
                .orderBy("date", "desc")
                .get();
            const records = [];
            snapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return records;
        } catch (error) {
            showAlert(`Error fetching attendance by date: ${error.message}`, 'error');
            console.error("Error fetching attendance by date:", error);
            return [];
        }
    }

    // UPDATE - Update attendance record
    async updateAttendance(attendanceId, attendanceData) {
        try {
            await db.collection(this.collection).doc(attendanceId).update({
                ...attendanceData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showAlert("Attendance updated successfully", 'success');
            return true;
        } catch (error) {
            showAlert(`Error updating attendance: ${error.message}`, 'error');
            console.error("Error updating attendance:", error);
            return false;
        }
    }

    // DELETE - Remove attendance record
    async deleteAttendance(attendanceId) {
        try {
            await db.collection(this.collection).doc(attendanceId).delete();
            showAlert("Attendance record deleted", 'success');
            return true;
        } catch (error) {
            showAlert(`Error deleting attendance: ${error.message}`, 'error');
            console.error("Error deleting attendance:", error);
            return false;
        }
    }
}
    
// ==========================================
// SESSIONS CRUD OPERATIONS
// ==========================================

class SessionsService {
    constructor() {
        this.collection = "sessions";
    }

    // CREATE - Submit new session
    async submitsession(sessionData) {
        try {
            const docRef = await db.collection(this.collection).add({
                ...sessionData,
                status: "pending",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showAlert("Session submitted successfully", 'success');
            return docRef.id;
        } catch (error) {
            showAlert(`Error submitting session: ${error.message}`, 'error');
            console.error("Error submitting session:", error);
            return null;
        }
    }

    // READ - Get all sessions
    async getAllRequests() {
        try {
            const snapshot = await db.collection(this.collection)
                .orderBy("createdAt", "desc")
                .get();
            const sessions = [];
            snapshot.forEach(doc => {
                sessions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return sessions;
        } catch (error) {
            showAlert(`Error fetching sessions: ${error.message}`, 'error');
            console.error("Error fetching sessions:", error);
            return [];
        }
    }

    // READ - Get requests by status
    async getSessionsByStatus(status) {
        try {
            const snapshot = await db.collection(this.collection)
                .where("status", "==", status)
                .orderBy("createdAt", "desc")
                .get();
            const sessions = [];
            snapshot.forEach(doc => {
                sessions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return sessions;
        } catch (error) {
            showAlert(`Error fetching sessions by status: ${error.message}`, 'error');
            console.error("Error fetching sessions by status:", error);
            return [];
        }
    }

    // UPDATE - Update session status
    async updateSessionStatus(sessionId, status, response = null) {
        try {
            const updateData = {
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
           
        
            await db.collection(this.collection).doc(sessionId).update(updateData);
            showAlert("Session status updated", 'success');
            return true;
        } catch (error) {
            showAlert(`Error updating session: ${error.message}`, 'error');
            console.error("Error updating session:", error);
            return false;
        }
    }

    // DELETE - Remove session
    async deleteRequest(sessionId) {
        try {
            await db.collection(this.collection).doc(sessionId).delete();
            showAlert("Session deleted", 'success');
            return true;
        } catch (error) {
            showAlert(`Error deleting session: ${error.message}`, 'error');
            console.error("Error deleting session:", error);
            return false;
        }
    }
}

 // ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Initialize services
const membersService = new MembersService();
const attendanceService = new AttendanceService();
const requestsService = new RequestsService();

// Show alert notification
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Real-time listener for members
function onMembersChange(callback) {
    return db.collection("members").onSnapshot(snapshot => {
        const members = [];
        snapshot.forEach(doc => {
            members.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(members);
    });
}

// Real-time listener for attendance
function onAttendanceChange(callback) {
    return db.collection("attendance").orderBy("date", "desc").onSnapshot(snapshot => {
        const records = [];
        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(records);
    });
}


// Real-time listener for sessions
function onSessionsChange(callback) {
    return db.collection("sessions").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const sessions = [];
        snapshot.forEach(doc => {
            sessions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(sessions);
    });
}


// Expose services for non-module scripts in index.html.
window.firebase = firebase;
window.db = db;
window.storage = storage;
window.membersService = membersService;
window.attendanceService = attendanceService;
window.sessionsService = sessionsService;
window.showAlert = showAlert;
window.onMembersChange = onMembersChange;
window.onAttendanceChange = onAttendanceChange;
window.onSessionsChange = onSessionsChange;


