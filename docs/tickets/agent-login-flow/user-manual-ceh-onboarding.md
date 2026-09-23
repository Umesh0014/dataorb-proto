> **Text-only copy.** The supplied manual embeds 18 screenshots as base64 data; those are stripped here so
> the repo stays light — image references are left in place as `![][imageN]` markers. Digest and design
> implications: [production-reference.md](production-reference.md).

**![][image1]**

# **User Manual: Customer Engagement Hub (CEH) \- User Onboarding for Contact Center Administrators**

## **Objective**

Empower contact center administrators to efficiently onboard team members across all operational roles, ensuring secure access and appropriate permissions for optimal platform utilization.

## **User Persona & Context**

**Primary User**: Contact Center Administrator (Admin Role)

## **Real-World Scenario**

Your contact center is expanding operations and needs to onboard 15 new team members including managers, quality evaluators, analysts, and agents. You need to ensure each user receives appropriate access permissions based on their role and compliance requirements for your industry vertical.

---

## 

## 

## 

## 

## **Step-by-Step User Onboarding Guide**

### **1\. Access User Management Hub**

* Navigate to **Settings** from the left navigation menu  
* Select **User Management** → **Users**  
* **Purpose**: Central command for all user account operations  
  *![][image2]*

### **2\. Create New User Profile & Role Assignment**

* Click **"+ New Users"** button in the Users module

  *![][image3]*

* Enter **Email ID**, **First Name**, and **Last Name**  
* Select appropriate **User Role** from dropdown:  
  * **Admin:** Manage the workspaces and users, visibility into all data   
  * **Manager:** Visibility into their specific agents and teams, create and publish evaluation scorecards and quality evaluation assignments i.e., Quality Manager  
  * **Evaluator:** A user that will complete QA evaluations, provide insights, and assist in coaching i.e., Quality analyst or quality evaluator  
  * **Analyst:** Visibility into organization-wide or team-based reporting, analytics and search i.e., Analytics team member  
  


  *![][image4]*


  


### **3\. Set User-Specific Permissions**

**For Manager Roles:**

* **Workspace Access**: Configure workspace access to be given (Managers will be able to see data for the agents who are part of the workspace only)  
* **Audio Player**: Configure based on quality monitoring needs  
* **Ask Mira Feature**: Enable for AI-assisted support

![][image5]

**For Evaluator/Analyst Roles:**

* **Agent Data Masking**: Configurable based on organizational policy (Users will not be able to view actual agent name/email ID fields on application, it will be masked)  
* **Audio Player Access**: Enable/disable per role requirements (Users will not be able to access the audio of the interaction in the interaction record view to playback the audio)  
  *![][image6]*

### **4\. Complete User Invitation**

* Review all entered details for accuracy  
* Click **"Add User"** (enabled once all required fields are completed)  
* **System Response**: Confirmation notification appears  
* **User Status**: Initially shows as "Invited" in user list  
  *![][image7]*

### **5\. User Onboarding Process**

**What Users Receives:**

* Email invitation with secure onboarding link  
* **Important**: Link expires after 30 days for security  
* User clicks "Get Started" or copies URL to browser  
  *![][image8]*

### **6\. Password Security Setup**

**User Experience:**

* Redirected to CEH password setup screen  
* Must meet security requirements (shown via info icon)  
* Enter new password and confirmation  
* Click "Done" to complete onboarding  
* **Automatic Redirect**: User lands on CEH Pulse Contact center dashboard  
* **Status Update**: User status changes from "Invited" to "Enabled"  
  *![][image9]*  
  *![][image10]*  
  *![][image11]*  
  


---

## **Key Takeaways**

* **Streamlined Onboarding**: Complete user setup in under 3 minutes  
* **Compliance-Ready**: Built-in data masking ensures regulatory adherence  
* **Role-Based Security**: Granular permissions protect sensitive information  
* **Scalable Process**: Efficient bulk user management for growing teams

## **Quick Troubleshooting**

**Q: User didn't receive an invitation email?**  
 **A**: Check spam folder, verify email address accuracy, resend invitation from user list

**Q: User can't complete password setup?**  
 **A**: Ensure password meets all requirements (shown in info tooltip), check link hasn't expired

**Q: Need to modify user permissions after onboarding?**  
 **A**: Use "Edit User" function from user list to update roles and permissions

**Q: User onboarding link is expired?**  
 **A**: The user must contact the Tenant Admin. The admin user will need to resend the invitation by following these steps:

1. Go to Settings → User Management → Users.  
2. Use the search bar to locate the user (e.g., type the name or email).  
3. Confirm the user’s Status is showing as **`Invited`**.  
4. Hover over the user row and click the three-dot menu.  
5. Select Re-Invite User.  
6. A confirmation pop-up — “Invitation Sent\!” — will appear on successful re-invite.

## **![][image12]**

![][image13]  
**Advanced User Management**

### **Editing User Access**

* Click **"Edit User"** from the user list  
* Modify workspace assignments, permissions, or personal details  
* **Real-Time Updates**: Changes take effect immediately

*![][image14]*

### **![][image15]**

### **Revoking User Access**

* Access **"Edit User"** functionality  
* Toggle user status to **"Revoke Access"**  
* **Automatic Notifications**: User receives email confirmation  
* **Status Update**: User status changes to "Disabled"  
* **Security Note**: Immediate platform access termination  
  *![][image16]*  
  *![][image17]*  
  *![][image18]*  
  


---

## **Platform Access Information**

**Login URL**: [https://ceh.dataorb.ai/login](https://ceh.dataorb.ai/login)

**Security**: All users must complete CAPTCHA verification for enhanced security
