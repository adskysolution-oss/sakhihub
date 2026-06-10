import dbConnect from '@/lib/dbConnect';
import SecurityDeposit from '@/models/SecurityDeposit';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';

export interface Rule {
  field: string;
  operator: 'equals' | 'contains' | 'between' | 'in';
  value: any;
}

export interface FilterGroup {
  condition: 'AND' | 'OR';
  rules: (Rule | FilterGroup)[];
}

export interface Recipient {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Extracts the targeted role filter from the rule tree to determine collection routing.
 */
export function extractRoleFromFilters(group: FilterGroup | null | undefined): string | null {
  if (!group || !group.rules) return null;
  for (const rule of group.rules) {
    if ('condition' in rule) {
      const subRole = extractRoleFromFilters(rule as FilterGroup);
      if (subRole) return subRole;
    } else {
      const r = rule as Rule;
      if (r.field === 'role' && r.value) {
        return r.value;
      }
    }
  }
  return null;
}

/**
 * Translates a single audience rule into a Mongoose query condition (for Users).
 */
async function translateRuleToMongo(rule: Rule): Promise<any> {
  const { field, value } = rule;

  switch (field) {
    case 'role':
      return { role: value };

    case 'status': {
      const val = value.toLowerCase();
      if (val === 'pending') {
        return { status: { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } };
      } else {
        return { status: val };
      }
    }

    case 'paymentStatus':
      if (value === 'paid') {
        return {
          $or: [
            { paymentCompleted: true },
            { subscriptionPaid: true }
          ]
        };
      } else {
        return {
          $and: [
            { paymentCompleted: { $ne: true } },
            { subscriptionPaid: { $ne: true } }
          ]
        };
      }

    case 'verificationStatus':
      if (value === 'verified') {
        return {
          $or: [
            { verificationStatus: 'verified' },
            { isVerified: true },
            { documentsVerified: true }
          ]
        };
      } else {
        // unverified
        return {
          $or: [
            { verificationStatus: 'pending' },
            { isVerified: false },
            { documentsVerified: false }
          ]
        };
      }

    case 'designation':
      return { designation: { $regex: value, $options: 'i' } };

    // Locations
    case 'country':
      return { address: { $regex: value || 'India', $options: 'i' } };
    case 'state':
      return {
        $or: [
          { state: { $regex: value, $options: 'i' } },
          { workState: { $regex: value, $options: 'i' } }
        ]
      };
    case 'district':
      return {
        $or: [
          { district: { $regex: value, $options: 'i' } },
          { workDistrict: { $regex: value, $options: 'i' } }
        ]
      };
    case 'block':
      return {
        $or: [
          { block: { $regex: value, $options: 'i' } },
          { workBlock: { $regex: value, $options: 'i' } }
        ]
      };
    case 'area':
    case 'village':
      return {
        $or: [
          { area: { $regex: value, $options: 'i' } },
          { workArea: { $regex: value, $options: 'i' } },
          { address: { $regex: value, $options: 'i' } },
          { workTehsil: { $regex: value, $options: 'i' } }
        ]
      };

    // Date
    case 'registrationDate':
      if (value && (value.start || value.end)) {
        const dateQuery: any = {};
        if (value.start) dateQuery.$gte = new Date(value.start);
        if (value.end) {
          const endOfDay = new Date(value.end);
          endOfDay.setHours(23, 59, 59, 999);
          dateQuery.$lte = endOfDay;
        }
        return { createdAt: dateQuery };
      }
      return {};

    // Security Deposit Filters
    case 'securityDeposit':
      if (value === 'paid') {
        return { depositPaid: true };
      } else if (value === 'pending') {
        return { depositPaid: false };
      } else if (value === 'eligible' || value === 'refunded') {
        const status = value === 'eligible' ? 'eligible' : 'processed';
        const deposits = await SecurityDeposit.find({ refundStatus: status }).select('vendorId').lean();
        const vendorIds = deposits.map(d => d.vendorId);
        return { _id: { $in: vendorIds } };
      }
      return {};

    default:
      return {};
  }
}

/**
 * Translates a single audience rule into a Member-specific query condition (post-lookup).
 */
async function translateRuleToMemberMongo(rule: Rule): Promise<any> {
  const { field, value } = rule;

  switch (field) {
    case 'status': {
      const val = value.toLowerCase();
      if (val === 'pending') {
        return {
          $or: [
            { "userDoc.status": { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } },
            { 
              $and: [
                { "userDoc.status": { $exists: false } },
                { accountStatus: 'pending' }
              ]
            }
          ]
        };
      } else {
        return {
          $or: [
            { "userDoc.status": val },
            {
              $and: [
                { "userDoc.status": { $exists: false } },
                { accountStatus: val }
              ]
            }
          ]
        };
      }
    }

    case 'paymentStatus':
      if (value === 'paid') {
        return { membershipStatus: 'paid' };
      } else {
        return { membershipStatus: { $ne: 'paid' } };
      }

    case 'verificationStatus':
      if (value === 'verified') {
        return {
          $or: [
            { "userDoc.verificationStatus": 'verified' },
            { "userDoc.isVerified": true },
            { "userDoc.documentsVerified": true }
          ]
        };
      } else {
        return {
          $or: [
            { "userDoc.verificationStatus": 'pending' },
            { "userDoc.isVerified": false },
            { "userDoc.documentsVerified": false }
          ]
        };
      }

    case 'designation':
      return { "userDoc.designation": { $regex: value, $options: 'i' } };

    case 'state':
      return { state: { $regex: value, $options: 'i' } };

    case 'district':
      return { district: { $regex: value, $options: 'i' } };

    case 'block':
      return { block: { $regex: value, $options: 'i' } };

    case 'area':
    case 'village':
      return {
        $or: [
          { village: { $regex: value, $options: 'i' } },
          { address: { $regex: value, $options: 'i' } }
        ]
      };

    case 'registrationDate':
      if (value && (value.start || value.end)) {
        const dateQuery: any = {};
        if (value.start) dateQuery.$gte = new Date(value.start);
        if (value.end) {
          const endOfDay = new Date(value.end);
          endOfDay.setHours(23, 59, 59, 999);
          dateQuery.$lte = endOfDay;
        }
        return { createdAt: dateQuery };
      }
      return {};

    default:
      return {};
  }
}

/**
 * Recursively translates a UI filter group tree into a MongoDB query block (for Users).
 */
export async function translateFiltersToMongoQuery(group: FilterGroup | null | undefined): Promise<any> {
  if (!group || !group.rules || group.rules.length === 0) {
    return {};
  }

  const list: any[] = [];

  for (const rule of group.rules) {
    if ('condition' in rule) {
      const subQuery = await translateFiltersToMongoQuery(rule as FilterGroup);
      if (Object.keys(subQuery).length > 0) {
        list.push(subQuery);
      }
    } else {
      const ruleQuery = await translateRuleToMongo(rule as Rule);
      if (Object.keys(ruleQuery).length > 0) {
        list.push(ruleQuery);
      }
    }
  }

  if (list.length === 0) {
    return {};
  }

  if (group.condition === 'OR') {
    return { $or: list };
  } else {
    return { $and: list };
  }
}

/**
 * Recursively translates a UI filter group tree into a MongoDB query block (for Members).
 */
export async function translateFiltersToMemberMongoQuery(group: FilterGroup | null | undefined): Promise<any> {
  if (!group || !group.rules || group.rules.length === 0) {
    return {};
  }

  const list: any[] = [];

  for (const rule of group.rules) {
    if ('condition' in rule) {
      const subQuery = await translateFiltersToMemberMongoQuery(rule as FilterGroup);
      if (Object.keys(subQuery).length > 0) {
        list.push(subQuery);
      }
    } else {
      const ruleQuery = await translateRuleToMemberMongo(rule as Rule);
      if (Object.keys(ruleQuery).length > 0) {
        list.push(ruleQuery);
      }
    }
  }

  if (list.length === 0) {
    return {};
  }

  if (group.condition === 'OR') {
    return { $or: list };
  } else {
    return { $and: list };
  }
}

/**
 * Centralized extractor service to fetch list of unified campaign recipients.
 */
export async function getCampaignRecipients(filters: FilterGroup | null | undefined): Promise<Recipient[]> {
  await dbConnect();

  const role = extractRoleFromFilters(filters);

  if (role === 'member') {
    const postLookupQuery = await translateFiltersToMemberMongoQuery(filters);

    const pipeline: any[] = [
      { $match: { accountStatus: { $ne: 'inactive' } } },
      // Deduplicate by mobile (matches dashboard logic)
      {
        $group: {
          _id: "$mobile",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      // Lookup Join User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc"
        }
      },
      {
        $unwind: {
          path: "$userDoc",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    if (Object.keys(postLookupQuery).length > 0) {
      pipeline.push({ $match: postLookupQuery });
    }

    pipeline.push({
      $project: {
        _id: { $ifNull: ["$userId", "$_id"] },
        fullName: { $ifNull: ["$name", "$userDoc.fullName"] },
        email: { $ifNull: ["$email", "$userDoc.email"] },
        role: { $literal: "member" }
      }
    });

    pipeline.push({
      $match: {
        email: { $exists: true, $ne: '' }
      }
    });

    const results = await WomenMember.aggregate(pipeline).allowDiskUse(true);

    return results.map(item => ({
      _id: item._id.toString(),
      fullName: item.fullName,
      email: item.email,
      role: item.role
    }));
  } else {
    const query = await translateFiltersToMongoQuery(filters);
    query.email = { $exists: true, $ne: '' };

    const users = await User.find(query).select('fullName email role').lean();

    return users.map(u => ({
      _id: u._id.toString(),
      fullName: u.fullName,
      email: u.email!,
      role: u.role
    }));
  }
}
