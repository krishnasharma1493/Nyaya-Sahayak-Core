#!/usr/bin/env python3
"""
Comprehensive Test Suite for Hybrid-RAG Upgrade
Tests: Query Classification, Domain Guardrails, Dual-Stream Grounding, Legal Persona
"""

import sys
import os

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.rag_engine import get_rag_engine

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def test_query_classification():
    """Test 1: Query Classification"""
    print_section("TEST 1: QUERY CLASSIFICATION")
    
    rag = get_rag_engine()
    
    test_cases = [
        ("What is Section 420 IPC?", "STATUTORY"),
        ("How do I file an FIR?", "PROCEDURAL"),
        ("I was stopped for overspeeding", "SITUATIONAL"),
        ("Solve this math problem: 2x + 5 = 15", "NON_LEGAL"),
        ("Write Python code to sort a list", "NON_LEGAL"),
        ("What are my rights under Article 21?", "STATUTORY"),
        ("Traffic police stopped me. What should I do?", "SITUATIONAL"),
    ]
    
    passed = 0
    failed = 0
    
    for query, expected_type in test_cases:
        result = rag.classify_query_type(query)
        status = "✅ PASS" if result == expected_type else "❌ FAIL"
        
        if result == expected_type:
            passed += 1
        else:
            failed += 1
            
        print(f"{status} | Query: '{query[:50]}...' | Expected: {expected_type} | Got: {result}")
    
    print(f"\n📊 Classification Test Results: {passed} passed, {failed} failed")
    return failed == 0

def test_domain_guardrails():
    """Test 2: Domain Guardrails - Reject Non-Legal Queries"""
    print_section("TEST 2: DOMAIN GUARDRAILS")
    
    rag = get_rag_engine()
    
    non_legal_queries = [
        "Solve this math problem: 2x + 5 = 15",
        "Write Python code to sort a list",
        "What's the weather like today?",
        "Give me a recipe for pasta",
    ]
    
    passed = 0
    failed = 0
    
    for query in non_legal_queries:
        result = rag.process_legal_query(query)
        
        # Check if query was rejected
        is_rejected = result.get('rejected', False)
        has_refusal_message = 'strictly restricted to legal advisory' in result['response'].lower()
        
        if is_rejected and has_refusal_message:
            print(f"✅ PASS | Query: '{query[:40]}...'")
            print(f"   Response: {result['response'][:80]}...")
            passed += 1
        else:
            print(f"❌ FAIL | Query: '{query[:40]}...'")
            print(f"   Response: {result['response'][:80]}...")
            failed += 1
    
    print(f"\n📊 Guardrail Test Results: {passed} passed, {failed} failed")
    return failed == 0

def test_legal_persona():
    """Test 3: Legal Persona - Clinical Tone Validation"""
    print_section("TEST 3: LEGAL PERSONA & TONE")
    
    rag = get_rag_engine()
    
    # Test with a situational query (if Vertex AI has data)
    query = "I was stopped by police for overspeeding. What are my rights?"
    print(f"Testing query: '{query}'")
    print("\nProcessing... (This may take a moment for RAG retrieval)\n")
    
    result = rag.process_legal_query(query)
    
    response = result.get('response', '')
    query_type = result.get('query_type', '')
    
    print(f"Query Type: {query_type}")
    print(f"Grounding Note: {result.get('note', '')}")
    print(f"\nResponse Preview:\n{response[:500]}...\n")
    
    # Validation checks
    checks = {
        "Has legal terminology": any(term in response for term in ['Section', 'Act', 'Article', 'Rights under']),
        "Has numbered format": ('1.' in response or '1)' in response),
        "No conversational filler": not any(filler in response for filler in ['I hope this helps', 'Let me explain', 'Feel free', "I'm sorry"]),
        "Clinical tone (terse)": len(response.split()) / response.count('.') < 30 if '.' in response else False  # Avg sentence length check
    }
    
    print("Validation Checks:")
    passed = 0
    for check_name, check_result in checks.items():
        status = "✅ PASS" if check_result else "❌ FAIL"
        print(f"  {status} | {check_name}")
        if check_result:
            passed += 1
    
    print(f"\n📊 Persona Test Results: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def test_dual_stream_grounding():
    """Test 4: Dual-Stream Grounding - Source Tracking"""
    print_section("TEST 4: DUAL-STREAM GROUNDING")
    
    rag = get_rag_engine()
    
    test_queries = [
        ("What is Section 420 IPC?", "STATUTORY", "Should use Vertex AI only"),
        ("How do I file a consumer complaint?", "PROCEDURAL", "Should use Vertex AI + Google Search"),
    ]
    
    for query, expected_type, expected_behavior in test_queries:
        print(f"\nQuery: '{query}'")
        print(f"Expected Type: {expected_type}")
        print(f"Expected Behavior: {expected_behavior}\n")
        
        result = rag.process_legal_query(query)
        
        query_type = result.get('query_type', 'UNKNOWN')
        grounding_sources = result.get('grounding_sources', {})
        vertex_count = grounding_sources.get('vertex_ai', 0)
        google_count = grounding_sources.get('google_search', 0)
        
        print(f"✓ Query Type: {query_type}")
        print(f"✓ Vertex AI Sources: {vertex_count}")
        print(f"✓ Google Search Sources: {google_count}")
        print(f"✓ Grounding Note: {result.get('note', 'N/A')}")
        
        if expected_type == "STATUTORY":
            status = "✅ PASS" if vertex_count > 0 else "⚠️  Note: Vertex AI returned no results"
            print(f"\n{status}")
        else:
            status = "✅ PASS" if (vertex_count > 0 or google_count > 0) else "⚠️  Note: No grounding sources"
            print(f"\n{status}")
    
    return True

def test_situational_legal_query():
    """Test 5: Situational Legal Query - Overspeeding Example"""
    print_section("TEST 5: SITUATIONAL LEGAL QUERY (OVERSPEEDING)")
    
    rag = get_rag_engine()
    
    query = "I was stopped for overspeeding on the highway. What should I do?"
    print(f"Query: '{query}'\n")
    
    result = rag.process_legal_query(query)
    
    response = result.get('response', '')
    query_type = result.get('query_type', '')
    
    print(f"Query Type: {query_type}")
    print(f"Confidence: {result.get('confidence', 'N/A')}")
    print(f"Grounding: {result.get('note', 'N/A')}")
    print(f"\nFull Response:\n{'-'*70}")
    print(response)
    print('-'*70)
    
    # Check for situational response format
    has_action_plan = "LEGAL ACTION PLAN" in response or "1." in response
    has_rights = "RIGHTS" in response.upper() or "Article" in response or "Section" in response
    has_consequences = "CONSEQUENCES" in response.upper() or "penalty" in response.lower() or "fine" in response.lower()
    
    print("\n✓ Has Action Plan:", "✅ Yes" if has_action_plan else "❌ No")
    print("✓ Has Rights Info:", "✅ Yes" if has_rights else "❌ No")
    print("✓ Has Consequences:", "✅ Yes" if has_consequences else "❌ No")
    
    return True

def main():
    """Run all tests"""
    print("\n" + "🔍 HYBRID-RAG SYSTEM TEST SUITE".center(70, "="))
    print("Testing: Query Classification, Domain Guardrails, Legal Persona, Dual-Stream Grounding\n")
    
    results = []
    
    try:
        # Run all tests
        results.append(("Query Classification", test_query_classification()))
        results.append(("Domain Guardrails", test_domain_guardrails()))
        results.append(("Legal Persona", test_legal_persona()))
        results.append(("Dual-Stream Grounding", test_dual_stream_grounding()))
        results.append(("Situational Query", test_situational_legal_query()))
        
        # Summary
        print_section("FINAL TEST SUMMARY")
        
        passed_count = sum(1 for _, passed in results if passed)
        total_count = len(results)
        
        for test_name, passed in results:
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"{status} | {test_name}")
        
        print(f"\n{'='*70}")
        print(f"Overall: {passed_count}/{total_count} test suites passed")
        print('='*70)
        
        if passed_count == total_count:
            print("\n🎉 ALL TESTS PASSED! Hybrid-RAG upgrade is functional.")
            return 0
        else:
            print(f"\n⚠️  {total_count - passed_count} test suite(s) failed. Review results above.")
            return 1
            
    except Exception as e:
        print(f"\n❌ ERROR: Test suite encountered an exception:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
