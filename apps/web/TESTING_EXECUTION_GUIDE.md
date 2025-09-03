# REAL USER TESTING EXECUTION GUIDE

## PRE-TESTING SETUP

### Testing Environment Checklist
- [ ] Stable internet connection
- [ ] Multiple browsers available (Chrome, Firefox, Safari)
- [ ] Mobile device for mobile testing
- [ ] Screenshot tools ready
- [ ] Test email accounts prepared
- [ ] Testing data prepared

### Test Data Preparation

#### Client Test User Data
```
Name: Maria Rodriguez
Email: maria.rodriguez.test.2025@gmail.com
Phone: +54 11 4567-8901
Location: Buenos Aires, Argentina
Birthdate: 15/03/1985
Professional Area: N/A (Client)
```

#### Professional Test User Data
```
Name: Carlos Martinez
Email: carlos.martinez.professional.2025@gmail.com
Phone: +54 11 9876-5432
Location: Cordoba, Argentina
Birthdate: 22/08/1980
Professional Area: Plumbing
Experience: 8 years
Specialties: Emergency repairs, bathroom renovations
Certifications: Certified plumber, Gas installation license
```

## TESTING EXECUTION WORKFLOW

### Phase 1: Client User Testing
1. **Start with fresh browser/incognito mode**
2. **Document every click, every form field, every error**
3. **Take screenshots of any unexpected behavior**
4. **Note loading times and user flow disruptions**

### Phase 2: Professional User Testing
1. **Use different browser or device**
2. **Test with realistic professional scenarios**
3. **Focus on service creation and management flows**

### Phase 3: Cross-User Testing
1. **Test interactions between the two accounts**
2. **Verify communication features work properly**
3. **Test booking/inquiry flows end-to-end**

## DOCUMENTATION STANDARDS

### For Each Test Step:
- **Status:** ✅ PASSED / ❌ FAILED / ⚠️ ISSUE / ⏳ PENDING
- **Time Taken:** Record how long each step takes
- **Notes:** Detailed observations about user experience
- **Issues:** Any problems encountered
- **Screenshots:** Reference to saved screenshots

### Issue Severity Levels:
- **🚨 CRITICAL:** Prevents core functionality, blocks user journey
- **❌ HIGH:** Significant impact on user experience
- **⚠️ MEDIUM:** Minor usability issues, doesn't block functionality
- **🔧 LOW:** Enhancement opportunities, minor improvements

### Screenshot Naming Convention:
```
YYYY-MM-DD_HH-MM_[PHASE]_[STEP]_[STATUS].png

Examples:
2025-09-01_14-30_CLIENT_REGISTRATION_ERROR.png
2025-09-01_14-35_CLIENT_PROFILE_SUCCESS.png
2025-09-01_15-00_PROFESSIONAL_DASHBOARD_ISSUE.png
```

## SPECIFIC TESTING SCENARIOS

### Realistic Client Journey
1. **Discovery:** "I need someone to fix my kitchen faucet"
2. **Search:** Look for plumbers in Buenos Aires
3. **Evaluation:** Compare different professionals
4. **Contact:** Reach out to selected professional
5. **Booking:** Attempt to schedule service

### Realistic Professional Journey
1. **Onboarding:** "I want to offer plumbing services"
2. **Profile Creation:** Build professional profile
3. **Service Setup:** Create service offerings
4. **Management:** Edit services and respond to inquiries
5. **Communication:** Interact with potential clients

## ERROR DOCUMENTATION TEMPLATE

### For Each Error Found:
```markdown
## Error #[NUMBER]: [BRIEF DESCRIPTION]

**Severity:** 🚨/❌/⚠️/🔧
**User Type:** Client/Professional/Both
**Page/Feature:** [Specific location]
**Browser:** [Browser and version]
**Device:** Desktop/Mobile/Tablet

### Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior:
[What should happen]

### Actual Behavior:
[What actually happened]

### Error Messages:
[Any error messages displayed]

### Screenshots:
- [Screenshot filename 1]
- [Screenshot filename 2]

### Impact Assessment:
[How this affects users]

### Recommended Fix:
[Suggested solution]
```

## USABILITY EVALUATION CRITERIA

### Navigation
- [ ] Intuitive menu structure
- [ ] Clear page hierarchy
- [ ] Easy to find important features
- [ ] Consistent navigation patterns

### Forms
- [ ] Clear field labels
- [ ] Helpful validation messages
- [ ] Logical field ordering
- [ ] Easy error recovery

### Search & Discovery
- [ ] Relevant search results
- [ ] Effective filtering options
- [ ] Clear service categorization
- [ ] Good default sorting

### Mobile Experience
- [ ] Responsive design works properly
- [ ] Touch targets are appropriate size
- [ ] Text is readable without zooming
- [ ] Key features accessible on mobile

### Performance
- [ ] Pages load within 3 seconds
- [ ] Images load promptly
- [ ] No significant delays in user interactions
- [ ] Search responds quickly

## POST-TESTING ANALYSIS

### Completion Checklist
- [ ] All test scenarios executed
- [ ] All issues documented
- [ ] Screenshots organized
- [ ] Performance metrics recorded
- [ ] User experience notes compiled
- [ ] Recommendations prepared

### Report Compilation
1. Update REAL_USER_TESTING_REPORT.md with findings
2. Prioritize issues by severity and impact
3. Create actionable recommendations
4. Prepare executive summary
5. Document next testing cycle requirements

## EMERGENCY PROCEDURES

### If Critical Issues Found:
1. **Document immediately** with detailed steps to reproduce
2. **Take screenshots** of the error state
3. **Note the impact** on user workflow
4. **Test workarounds** if possible
5. **Flag for immediate attention**

### If Testing Environment Issues:
1. **Switch browsers** if browser-specific issues
2. **Clear cache/cookies** if session issues
3. **Check network connection** if loading problems
4. **Use different devices** if device-specific issues
5. **Document environment-specific problems**

---

**Remember:** Test as a real user would - with realistic expectations, limited patience, and no prior knowledge of the system's intended behavior.