import assert from 'node:assert/strict'
import test from 'node:test'
import {
    parseEmploymentAnalysis,
    passesAutomaticEmploymentVerification,
} from '../src/lib/verification/employment-analysis.ts'

const matchingResult = {
    is_verified: true,
    confidence_score: 95,
    extracted_name: 'Savio Mohan',
    extracted_company: 'Epsilon',
    reasoning: 'The claimed name and company match the document.',
}

test('normalizes a verified 1.0 fraction to 100 percent', () => {
    const analysis = parseEmploymentAnalysis({ ...matchingResult, confidence_score: 1 })

    assert.ok(analysis)
    assert.equal(analysis.confidenceScore, 100)
    assert.equal(passesAutomaticEmploymentVerification(analysis), true)
})

test('normalizes other verified fractional scores before applying the threshold', () => {
    const passing = parseEmploymentAnalysis({ ...matchingResult, confidence_score: 0.95 })
    const failing = parseEmploymentAnalysis({ ...matchingResult, confidence_score: 0.75 })

    assert.ok(passing)
    assert.ok(failing)
    assert.equal(passing.confidenceScore, 95)
    assert.equal(failing.confidenceScore, 75)
    assert.equal(passesAutomaticEmploymentVerification(passing), true)
    assert.equal(passesAutomaticEmploymentVerification(failing), false)
})

test('does not turn a rejected 1 percent result into an approval', () => {
    const analysis = parseEmploymentAnalysis({ ...matchingResult, is_verified: false, confidence_score: 1 })

    assert.ok(analysis)
    assert.equal(analysis.confidenceScore, 1)
    assert.equal(passesAutomaticEmploymentVerification(analysis), false)
})

test('keeps percentage scores and the 90 percent threshold unchanged', () => {
    const passing = parseEmploymentAnalysis(matchingResult)
    const failing = parseEmploymentAnalysis({ ...matchingResult, confidence_score: 89 })

    assert.ok(passing)
    assert.ok(failing)
    assert.equal(passesAutomaticEmploymentVerification(passing), true)
    assert.equal(passesAutomaticEmploymentVerification(failing), false)
})

test('fails safely when required structured fields are malformed', () => {
    assert.equal(parseEmploymentAnalysis({ ...matchingResult, confidence_score: '1' }), null)
    assert.equal(parseEmploymentAnalysis({ ...matchingResult, extracted_company: '' }), null)
    assert.equal(parseEmploymentAnalysis({ ...matchingResult, is_verified: 'true' }), null)
    assert.equal(parseEmploymentAnalysis({ ...matchingResult, confidence_score: 101 }), null)
})
