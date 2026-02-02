#!/usr/bin/env python3
"""
Test Suite: Situational Query Handling for Nyaya-Sahayak
"""

import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def test_situational_query_traffic():
    """Test: Traffic police stop scenario"""
    from app.rag_engine import get_rag_engine
    
    print("\\n" + "="*70)
    print("TEST 1: Traffic Police Stop (Situational Query)")
    print("="*70)
    
    rag = get_rag_engine()
    query = "Traffic police stopped me for not wearing helmet. What should I do?"
    
    print(f"\\nQuery: {query}")
    print("\\nProcessing...\\n")
    
    result = rag.process_legal_query(query)
    
    print(f"Query Type: {result.get('query_type')}" )
    print(f"Confidence: {result.get('confidence')}")
    print(f"Note: {result.get('note')}\\n")
    
    print("Response:")
    print("-" * 70)
    print(result['response'])
    print("-" * 70)
    
    print("\\nSources:")
    for idx, source in enumerate(result['sources'], 1):
        print(f"{idx}. {source['document']} - Page: {source['page']}")
    
    # Assertions
    assert result.get('query_type') == 'SITUATIONAL', f"Expected SITUATIONAL, got {result.get('query_type')}"
    assert 'LEGAL ACTION PLAN' in result['response'], "Expected LEGAL ACTION PLAN format"
    assert result.get('rejected') != True, "Query should not be rejected"
    
    print("\\n✅ TEST 1 PASSED\\n")
    return True

def test_domain_lock_non_legal():
    """Test: Domain lock for non-legal queries"""
    from app.rag_engine import get_rag_engine
    
    print("\\n" + "="*70)
    print("TEST 2: Domain Lock (Non-Legal Query Rejection)")
    print("="*70)
    
    rag = get_rag_engine()
    query = "How to cook pasta?"
    
    print(f"\\nQuery: {query}")
    print("\\nProcessing...\\n")
    
    result = rag.process_legal_query(query)
    
    print(f"Query Type: {result.get('query_type')}")
    print(f"Rejected: {result.get('rejected')}")
    print(f"Note: {result.get('note')}\\n")
    
    print("Response:")
    print("-" * 70)
    print(result['response'])
    print("-" * 70)
    
    # Assertions
    assert result.get('query_type') == 'NON_LEGAL', f"Expected NON_LEGAL, got {result.get('query_type')}"
    assert result.get('rejected') == True, "Non-legal query should be rejected"
    assert "strictly restricted to legal advisory" in result['response'], "Expected rejection message"
    
    print("\\n✅ TEST 2 PASSED (Domain Lock Working)\\n")
    return True

def main():
    """Run all tests"""
    print("\\n" + "#"*70)
    print("# NYAYA-SAHAYAK: Situational Query Test Suite")
    print("# Testing Hybrid Grounding Refactoring")
    print("#"*70)
    
    # Check environment
    print("\\nEnvironment Check:")
    print(f"GOOGLE_API_KEY: {'✅ Set' if os.getenv('GOOGLE_API_KEY') else '❌ Missing'}")
    print(f"PROJECT_ID: {os.getenv('PROJECT_ID', '❌ Missing')}")
    print(f"DATA_STORE_ID: {os.getenv('DATA_STORE_ID', '❌ Missing')}")
    print(f"ENABLE_GOOGLE_SEARCH_GROUNDING: {os.getenv('ENABLE_GOOGLE_SEARCH_GROUNDING', 'false')}")
    
    tests = [
        test_situational_query_traffic,
        test_domain_lock_non_legal
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
        except AssertionError as e:
            print(f"\\n❌ TEST FAILED: {test_func.__name__}")
            print(f"Error: {str(e)}\\n")
            failed += 1
        except Exception as e:
            print(f"\\n❌ TEST ERROR: {test_func.__name__}")
            print(f"Error: {str(e)}\\n")
            failed += 1
    
    # Summary
    print("\\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total Tests: {len(tests)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print("="*70)
    
    if failed == 0:
        print("\\n🎉 ALL TESTS PASSED! Hybrid grounding is working correctly.\\n")
        return 0
    else:
        print(f"\\n⚠️  {failed} test(s) failed. Please review the errors above.\\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
