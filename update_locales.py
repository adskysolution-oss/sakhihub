import json
import os

locales_dir = 'public/locales'

en_data = {
    'employeeDashboard': {
        'verifyActionReq': 'Action Required: Verify Your Profile',
        'verifyReuploadReq': 'Some of your uploaded documents were rejected. Please check and re-upload.',
        'verifyUnderReview': 'Your documents are currently under review by the Admin team.',
        'verifyMandatory': 'You must upload all mandatory documents (Aadhaar, PAN, Bank Details, etc.) to activate your account.',
        'manageDocs': 'Manage Documents',
        'verifiedActive': 'Verified Active',
        'pendingVerification': 'Pending Verification',
        'actionsDisabled': 'Actions Disabled',
        'actionsDisabledDesc': 'You must complete your document verification to unlock member registration, group creation, and other features.'
    }
}

hi_data = {
    'employeeDashboard': {
        'verifyActionReq': 'कार्रवाई आवश्यक: अपना प्रोफ़ाइल सत्यापित करें',
        'verifyReuploadReq': 'आपके कुछ अपलोड किए गए दस्तावेज़ अस्वीकार कर दिए गए। कृपया जांचें और फिर से अपलोड करें।',
        'verifyUnderReview': 'आपके दस्तावेज़ वर्तमान में व्यवस्थापक टीम द्वारा समीक्षाधीन हैं।',
        'verifyMandatory': 'अपना खाता सक्रिय करने के लिए आपको सभी अनिवार्य दस्तावेज़ (आधार, पैन, बैंक विवरण, आदि) अपलोड करने होंगे।',
        'manageDocs': 'दस्तावेज़ प्रबंधित करें',
        'verifiedActive': 'सत्यापित और सक्रिय',
        'pendingVerification': 'सत्यापन लंबित',
        'actionsDisabled': 'कार्रवाइयां अक्षम की गईं',
        'actionsDisabledDesc': 'सदस्य पंजीकरण, समूह निर्माण और अन्य सुविधाओं को अनलॉक करने के लिए आपको अपना दस्तावेज़ सत्यापन पूरा करना होगा।'
    }
}

projects_en_additions = {
    'newInitiatives': 'New Initiatives Coming Soon',
    'newInitDesc': 'We are currently designing impactful programs to empower more women across India.',
    'initiativeDetail': 'Initiative Detail',
    'joinProgram': 'Join Program',
    'becomeMember': 'Become Member',
    'programOverview': 'Program Overview',
    'overviewHeading': 'Redefining Women Empowerment Through <span className=\"text-primary italic\">Micro-Industry.</span>',
    'featSustainable': 'Sustainable',
    'featSustainableDesc': 'Built for long-term rural development.',
    'featCommunity': 'Community',
    'featCommunityDesc': 'Empowering collective growth.',
    'keyHighlights': 'Key Highlights',
    'wantToKnowMore': 'Want to know more?',
    'expertHelp': 'Our field executives are ready to help you join this program in your village.',
    'contactExpert': 'Contact an Expert',
    'startJourneyHeading': 'Start your journey <br /> with <span className=\"text-primary italic\">SakhiHub.</span>',
    'getStarted': 'Get Started Today',
    'notFound': 'Project Not Found',
    'notFoundDesc': 'The project you are looking for does not exist or has been removed.',
    'backToProjects': 'Back to Projects'
}

projects_hi_additions = {
    'newInitiatives': 'नई पहलें जल्द आ रही हैं',
    'newInitDesc': 'हम वर्तमान में पूरे भारत में अधिक महिलाओं को सशक्त बनाने के लिए प्रभावशाली कार्यक्रम डिजाइन कर रहे हैं।',
    'initiativeDetail': 'पहल का विवरण',
    'joinProgram': 'कार्यक्रम से जुड़ें',
    'becomeMember': 'सदस्य बनें',
    'programOverview': 'कार्यक्रम अवलोकन',
    'overviewHeading': '<span className=\"text-primary italic\">सूक्ष्म-उद्योग</span> के माध्यम से महिला सशक्तिकरण को फिर से परिभाषित करना।',
    'featSustainable': 'टिकाऊ',
    'featSustainableDesc': 'दीर्घकालिक ग्रामीण विकास के लिए निर्मित।',
    'featCommunity': 'समुदाय',
    'featCommunityDesc': 'सामूहिक विकास को सशक्त बनाना।',
    'keyHighlights': 'मुख्य विशेषताएं',
    'wantToKnowMore': 'क्या आप और जानना चाहते हैं?',
    'expertHelp': 'हमारे फील्ड एक्जीक्यूटिव आपके गांव में इस कार्यक्रम में शामिल होने में आपकी मदद करने के लिए तैयार हैं।',
    'contactExpert': 'विशेषज्ञ से संपर्क करें',
    'startJourneyHeading': '<span className=\"text-primary italic\">सखीहब</span> के साथ <br /> अपनी यात्रा शुरू करें।',
    'getStarted': 'आज ही शुरू करें',
    'notFound': 'परियोजना नहीं मिली',
    'notFoundDesc': 'आप जिस परियोजना की तलाश कर रहे हैं वह मौजूद नहीं है या हटा दी गई है।',
    'backToProjects': 'परियोजनाओं पर वापस जाएं'
}

def update_json(file_path, new_data, projects_additions):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # update employeeDashboard
        data['employeeDashboard'] = new_data['employeeDashboard']
        
        # update projects
        if 'projects' not in data:
            data['projects'] = {}
        for k, v in projects_additions.items():
            data['projects'][k] = v
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

update_json(os.path.join(locales_dir, 'en/common.json'), en_data, projects_en_additions)
update_json(os.path.join(locales_dir, 'hi/common.json'), hi_data, projects_hi_additions)

print('Translation files updated successfully.')
