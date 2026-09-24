import assert from 'node:assert/strict'
import test from 'node:test'
import {
    FIXED_CANDIDATE_POOL_SIZE,
    normalizeJobRole,
    parseReferralType,
    poolSizeForReferralType,
} from '../src/lib/jobs/job-submission.ts'

test('accepts an editable job role independently of the employee designation', () => {
    assert.equal(normalizeJobRole('  Senior Backend Engineer  '), 'Senior Backend Engineer')
    assert.equal(normalizeJobRole(''), null)
    assert.equal(normalizeJobRole('x'), null)
    assert.equal(normalizeJobRole('x'.repeat(121)), null)
})

test('fixes every candidate pool at exactly ten applications', () => {
    assert.equal(FIXED_CANDIDATE_POOL_SIZE, 10)
    assert.equal(poolSizeForReferralType('pooling'), 10)
    assert.equal(poolSizeForReferralType('single'), null)
})

test('rejects unknown referral routes instead of silently downgrading them', () => {
    assert.equal(parseReferralType('pooling'), 'pooling')
    assert.equal(parseReferralType('single'), 'single')
    assert.equal(parseReferralType('anything-else'), null)
})
